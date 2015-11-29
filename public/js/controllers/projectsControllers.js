import angular from 'angular';
import moment from 'moment';
import utils from 'public/js/utils';
import config from 'public/js/appConfig';

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
        'ProjectsService',
        'ClientsService',
        'SettingsUser',
        'screenSize',
        'feedback',
        ($scope, $q, $routeParams, tpmCache, Projects, Clients, SettingsUser, screenSize, feedback) => {

            $scope.filterStatus = tpmCache.get('filterStatus') || '';
            $scope.filterStatusOptions = utils.statusList;
            $scope.filterActiveStatusOptions = utils.getActiveStatusList();
            $scope.filterInactiveStatusOptions = utils.getInactiveStatusList();
            $scope.filterClient = $routeParams.id || '';
            $scope.currency = SettingsUser.get().currency;

            $scope.isLoading = true;
            $scope.isEnabledToggleActions = screenSize.is('xs, sm');
            $scope.showActions = false;

            !feedback.isActive() && feedback.load();

            $q.all([
                Projects.query().$promise,
                Clients.query().$promise
            ]).then((data) => {

                $scope.clientsList = data[1];
                $scope.projectsList = initProjectsList( data[0] );
                $scope.isLoading = false;
                feedback.isLoading() && feedback.dismiss();

            });

            function getClientById(id) {
                var filtered = $scope.clientsList.filter((client) => {
                    return client.id === id;
                });

                return filtered[0];
            }

            function getProjectIndex(id) {
                return $scope.projectsList.findIndex((project, idx) => project.id === id);
            }

            function initProjectsList(arr) {
                angular.forEach( arr, (project) => {

                    // set remaining time, for active projects
                    var remaining = utils.getRemainingWorkTime( project.dateEstimated );
                    project.remainingDays = Math.round( remaining.daysWork );
                    project.remainingText = remaining.textTotal;
                    project.remainingWeekendDays = remaining.weekendDays;
                    project.dateEstimatedFormatted = moment(project.dateEstimated).format('ddd, DD MMM');

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

            $scope.deleteProject = (id) => {
                Projects.delete({ id: id });
                $scope.projectsList.splice(getProjectIndex(id), 1);
                feedback.notify('Project was deleted');
            };

            $scope.setFilterStatus = (filter) => {
                $scope.filterStatus = filter;
                tpmCache.put('filterStatus', filter);
            };

            $scope.orderCriteria = () => {
                if ( $scope.filterInactiveStatusOptions.indexOf( $scope.filterStatus ) > -1 ) {
                    return 'passedDays';
                }

                return 'remainingDays';
            };

            $scope.isProjectOverdue = (project) => {
                return (
                    $scope.filterActiveStatusOptions.indexOf(project.status) > -1 &&
                    project.remainingDays < 0
                ) || (
                    project.status === 'finished' &&
                    project.passedDays > 30
                );
            };

            $scope.isProjectLate = (project) => {
                return (
                    $scope.filterActiveStatusOptions.indexOf(project.status) > -1 &&
                    project.remainingDays <= project.days && project.remainingDays >= 0
                ) || (
                    project.status === 'finished' &&
                    project.passedDays > 7 && project.passedDays <= 30
                );
            };
        }
    ])

    .controller('ProjectsViewController', [
        '$scope',
        '$routeParams',
        'ProjectsService',
        ($scope, $routeParams, Projects) => {
            Projects.get({ id: $routeParams.id }).$promise.then((data) => {
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
        '$filter',
        '$location',
        'ProjectsService',
        'ClientsService',
        'SettingsUser',
        'feedback',
        ($scope, $routeParams, $filter, $location, Projects, Clients, SettingsUser, feedback) => {

            $scope.formAction            = 'Add';
            $scope.formSubmit            = $scope.formAction + ' project';
            $scope.dateSettings          = dateSettings;
            $scope.selectedDateEstimated = new Date();
            $scope.isDatePickerOpened    = false;
            $scope.statusList            = utils.statusList;
            $scope.isNewClient           = false;
            $scope.isLoading             = false;
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

                // convert the dates to match the DB format
                $scope.project.dateEstimated = $filter('date')($scope.selectedDateEstimated, config.dateFormat);
                $scope.project.dateAdded = $filter('date')(new Date(), config.dateFormat);
                $scope.isLoading = true;
                $scope.formSubmit = 'Please wait ...';

                Projects.save($scope.project).$promise.then(() => {
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
        }
    ])

    .controller('ProjectsEditController', [
        '$scope',
        '$q',
        '$routeParams',
        '$filter',
        '$location',
        'ProjectsService',
        'ClientsService',
        'SettingsUser',
        'feedback',
        ($scope, $q, $routeParams, $filter, $location, Projects, Clients, SettingsUser, feedback) => {

            $scope.formAction            = 'Edit';
            $scope.formSubmit            = $scope.formAction + ' project';
            $scope.dateSettings          = dateSettings;
            $scope.selectedDateEstimated = new Date();
            $scope.isDatePickerOpened    = false;
            $scope.statusList            = utils.statusList;
            $scope.isLoading             = false;
            $scope.currency              = SettingsUser.get().currency;

            $q.all([
                Projects.get({ id: $routeParams.id }).$promise,
                Clients.query().$promise
            ]).then((data) => {

                $scope.project               = data[0];
                $scope.clientsList           = data[1];
                $scope.selectedDateEstimated = $scope.project.dateEstimated;

            });

            $scope.submitForm = () => {
                feedback.load();

                // convert the dates to match the DB format
                $scope.project.dateEstimated = $filter('date')($scope.selectedDateEstimated, config.dateFormat);
                $scope.project.dateAdded     = $filter('date')(new Date(), config.dateFormat);
                $scope.isLoading             = true;
                $scope.formSubmit            = 'Please wait ...';

                Projects.update({ id: $routeParams.id }, $scope.project).$promise.then(() => {
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

        }
    ]);
