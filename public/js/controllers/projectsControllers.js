import angular from 'angular';
import moment from 'moment';
import utils from 'public/js/utils';

// @todo move out !!!!!
const dateSettings = {
    dateFormat : 'dd MMMM yyyy',
    dateOptions: {
        formatYear: 'yy',
        startingDay: 1
    }
};

export default angular.module('TPM.ProjectsControllers', [])

    .controller('ProjectsListController', [
        '$scope',
        '$q',
        '$routeParams',
        'tpmCache',
        'Projects',
        'ClientsService',
        'SettingsUser',
        'screenSize',
        'feedback',
        ($scope, $q, $routeParams, tpmCache, Projects, Clients, SettingsUser, screenSize, feedback) => {

            $scope.displayedProjectList        = [];
            $scope.projectsList                = [];
            $scope.archivedList                = [];
            $scope.archivedNr                  = '-';
            $scope.filterStatus                = tpmCache.get('filterStatus') || '';
            $scope.filterStatusOptions         = utils.statusList.filter(s => s !== 'paid');
            $scope.filterActiveStatusOptions   = utils.getActiveStatusList();
            $scope.filterInactiveStatusOptions = utils.getInactiveStatusList();
            $scope.filterClient                = $routeParams.id || '';
            $scope.currency                    = SettingsUser.get().currency;

            $scope.isLoading              = true;
            $scope.showActions            = false;
            $scope.isEnabledToggleActions = screenSize.is('xs');

            !feedback.isActive() && feedback.load();

            $q.all([
                Projects.http().query().$promise,
                Clients.query().$promise,
                Projects.getProjectsArchivedNumber()
            ]).then((data) => {

                $scope.clientsList = data[1];
                $scope.projectsList = initProjectsList( data[0] );
                $scope.archivedNr = data[2].data.nr;
                $scope.isLoading = false;
                feedback.isLoading() && feedback.dismiss();
                setDisplayedProjectsList($scope.filterStatus);

            });

            function getClientById(id) {
                var filtered = $scope.clientsList.filter((client) => {
                    return client.id === id;
                });

                return filtered[0];
            }

            function getProjectIndex(id) {
                return $scope.projectsList.findIndex((project) => project.id === id);
            }

            function initProjectsList(arr) {
                angular.forEach( arr, (project) => {

                    if (project.status === 'paid') {
                        return;
                    }

                    // set remaining time, for active projects
                    if ( project.dateEstimated ) {
                        let remaining = utils.getRemainingWorkTime( project.dateEstimated );
                        project.remainingDays = Math.round( remaining.daysWork );
                        project.remainingText = remaining.textTotal;
                        project.remainingWeekendDays = remaining.weekendDays;
                        project.dateEstimatedFormatted = moment( project.dateEstimated ).format('DD MMM');
                    } else {
                        project.remainingDays = '-';
                        project.remainingText = 'no deadline';
                        project.remainingWeekendDays = '-';
                        project.dateEstimatedFormatted = '';
                    }

                    // set clients name
                    if ( !project.idClient ) {
                        project.clientName = '-';
                    } else {
                        project.clientName = getClientById( project.idClient ).name;
                    }

                    project.price = project.priceFinal > 0 ? project.priceFinal : project.priceEstimated;

                    // set passed time, for inactive projects
                    if (
                        project.date &&
                        $scope.filterInactiveStatusOptions.indexOf( project.status ) > -1
                    ) {
                        let passed = utils.getPassedTime( project.date );
                        project.passedText = passed.textTotal;
                        project.passedDays = Math.abs( Math.round( passed.daysWork ) );
                    }
                });

                return arr;
            }

            function getArchived() {
                return Projects.getProjectsArchived().then((archivedProjects) => {
                    $scope.archivedList = archivedProjects.data;
                });
            }

            function setDisplayedProjectsList(filter) {
                if (filter === 'paid') {
                    $scope.displayedProjectList = [];
                    $scope.isLoading = true;
                    feedback.load();
                    return getArchived().then(() => {
                        $scope.displayedProjectList = $scope.archivedList;
                        $scope.isLoading = false;
                        feedback.dismiss();
                    });
                }

                $scope.displayedProjectList = $scope.projectsList.filter(p => {
                    if (filter.length) {
                        // if we pass a specific filter
                        return (p.status === filter);
                    } else {
                        // if we don't pass specific filter
                        // return only the active statuses
                        return (utils.getActiveStatusList().indexOf(p.status) > -1);
                    }
                });
            }

            $scope.deleteProject = (id) => {
                Projects.http().delete({ id: id });
                $scope.projectsList.splice(getProjectIndex(id), 1);
                feedback.notify('Project was deleted');
            };

            $scope.setFilterStatus = (filter) => {
                $scope.filterStatus = filter;
                tpmCache.put('filterStatus', filter);
                setDisplayedProjectsList(filter);
            };

            $scope.orderCriteria = () => {
                if ( $scope.filterInactiveStatusOptions.indexOf( $scope.filterStatus ) > -1 ) {
                    return 'passedDays';
                }

                return 'remainingDays';
            };

            $scope.isProjectAlmostDone = (project) => {
                return project.status === 'almost done';
            };

            $scope.isProjectOverdue = (project) => {
                if ($scope.isProjectAlmostDone(project)) {
                    return false;
                }
                return (
                    $scope.filterActiveStatusOptions.indexOf(project.status) > -1 &&
                    project.remainingDays < 0
                ) || (
                    project.status === 'finished' &&
                    project.passedDays > 30
                );
            };

            $scope.isProjectLate = (project) => {
                if ($scope.isProjectAlmostDone(project)) {
                    return false;
                }
                return (
                    $scope.filterActiveStatusOptions.indexOf(project.status) > -1 &&
                    project.remainingDays <= project.days && project.remainingDays >= 0
                ) || (
                    project.status === 'finished' &&
                    project.passedDays > 7 && project.passedDays <= 30
                );
            };

            $scope.hasProjects = () => $scope.projectsList.length;
        }
    ])

    .controller('ProjectsViewController', [
        '$scope',
        '$routeParams',
        'Projects',
        ($scope, $routeParams, Projects) => {
            Projects.http().get({ id: $routeParams.id }).$promise.then((data) => {
                $scope.project = data;
                // set remaining time
                var remaining = utils.getRemainingWorkTime( data.dateEstimated );
                $scope.project.remainingDays = remaining.days;
                $scope.project.remainingText = remaining.text;
            });
        }
    ])

    .controller('ProjectsNewController', [
        '$scope',
        '$routeParams',
        '$location',
        'Projects',
        'ClientsService',
        'SettingsUser',
        'feedback',
        ($scope, $routeParams, $location, Projects, Clients, SettingsUser, feedback) => {

            $scope.formAction            = 'Add';
            $scope.formSubmit            = $scope.formAction + ' project';
            $scope.dateSettings          = dateSettings;
            $scope.selectedDateEstimated = new Date();
            $scope.isDatePickerOpened    = false;
            $scope.statusList            = utils.statusList;
            $scope.isNewClient           = false;
            $scope.isLoading             = false;
            $scope.hasDeadline           = true;
            $scope.currency              = SettingsUser.get().currency;

            // project model
            $scope.project = {
                name          : '',
                clientName    : '',
                priceEstimated: '',
                priceFinal    : '',
                days          : '',
                status        : utils.statusList[0],
                dateEstimated : '',
                dateAdded     : '',
                description   : ''
            };

            $scope.clientsList = Clients.query();

            $scope.submitForm = () => {
                feedback.load();

                $scope.isLoading = true;
                $scope.formSubmit = 'Please wait ...';

                let data = Projects.serialize( $scope );

                Projects.http().save( data ).$promise.then(() => {
                    $location.path('/projects');
                    feedback.notify('Project was added');
                });
            };

            $scope.openDatePicker = ($event) => {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.isDatePickerOpened = true;
            };

            $scope.clearClient = () => $scope.project.clientName = '';
            $scope.toggleDeadline = () => {
                $scope.hasDeadline = !$scope.hasDeadline;
                $scope.hasDeadline && ($scope.isDatePickerOpened = true);
            };
        }
    ])

    .controller('ProjectsEditController', [
        '$scope',
        '$q',
        '$routeParams',
        '$location',
        'Projects',
        'ClientsService',
        'SettingsUser',
        'feedback',
        ($scope, $q, $routeParams, $location, Projects, Clients, SettingsUser, feedback) => {

            $scope.formAction            = 'Edit';
            $scope.formSubmit            = $scope.formAction + ' project';
            $scope.dateSettings          = dateSettings;
            $scope.selectedDateEstimated = new Date();
            $scope.isDatePickerOpened    = false;
            $scope.statusList            = utils.statusList;
            $scope.isLoading             = false;
            $scope.hasDeadline           = true;
            $scope.currency              = SettingsUser.get().currency;

            $q.all([
                Projects.http().get({ id: $routeParams.id }).$promise,
                Clients.query().$promise
            ]).then((data) => {

                $scope.project               = data[0];
                $scope.clientsList           = data[1];
                $scope.selectedDateEstimated = $scope.project.dateEstimated;
                $scope.hasDeadline           = !!$scope.project.dateEstimated;

            });

            $scope.submitForm = () => {
                feedback.load();
                $scope.isLoading  = true;
                $scope.formSubmit = 'Please wait ...';

                let data = Projects.serialize( $scope );

                Projects.http().update({ id: $routeParams.id }, data).$promise.then(() => {
                    $location.path('/projects');
                    feedback.notify('Project was updated');
                });
            };

            $scope.openDatePicker = ($event) => {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.isDatePickerOpened = true;
            };

            $scope.clearClient = () => {
                $scope.project.clientName = '';
            };
            $scope.toggleDeadline = () => {
                $scope.hasDeadline = !$scope.hasDeadline;
                $scope.hasDeadline && ($scope.isDatePickerOpened = true);
            };
        }
    ]);
