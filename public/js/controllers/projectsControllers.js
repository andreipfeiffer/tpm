(function() {

    'use strict';

    var dateSettings = {
        dateFormat: 'dd MMMM yyyy',
        dateOptions: {
            formatYear: 'yy',
            startingDay: 1
        }
    };

    angular.module('TPM.ProjectsControllers', [])

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
            function($scope, $q, $routeParams, tpmCache, Projects, Clients, SettingsUser, screenSize, feedback) {

                $scope.filterStatus = tpmCache.get('filterStatus') || '';
                $scope.filterStatusOptions = TPM.utils.statusList;
                $scope.filterActiveStatusOptions = TPM.utils.getActiveStatusList();
                $scope.filterInactiveStatusOptions = TPM.utils.getInactiveStatusList();
                // $scope.filterClient = tpmCache.get('filterClient') || '';
                $scope.filterClient = $routeParams.id || '';
                $scope.currency = SettingsUser.get().currency;

                $scope.isLoading = true;
                $scope.isEnabledToggleActions = screenSize.is('xs, sm');
                $scope.showActions = false;

                !feedback.isActive() && feedback.load();

                $q.all([
                    Projects.query().$promise,
                    Clients.query().$promise
                ]).then(function(data) {

                    $scope.clientsList = data[1];
                    $scope.projectsList = initProjectsList( data[0] );
                    $scope.isLoading = false;
                    feedback.isLoading() && feedback.dismiss();

                });

                function getClientById(id) {
                    var filtered = $scope.clientsList.filter(function(client) {
                        return client.id === id;
                    });

                    return filtered[0];
                }

                function getProjectIndex(id) {
                    var index;

                    $scope.projectsList.forEach(function(project, idx) {
                        if (project.id === id) {
                            index = idx;
                        }
                    });

                    return index;
                }

                function initProjectsList(arr) {
                    angular.forEach( arr, function(project) {

                        // set clients name
                        if ( !project.idClient ) {
                            project.clientName = '-';
                        } else {
                            project.clientName = getClientById( project.idClient ).name;
                        }

                        project.price = project.priceFinal > 0 ? project.priceFinal : project.priceEstimated;

                        // set remaining time, for active projects
                        var remaining = TPM.utils.getRemainingWorkTime( project.dateEstimated );
                        project.remainingDays = Math.round( remaining.daysWork );
                        project.remainingText = remaining.textTotal;
                        project.remainingWeekendDays = remaining.weekendDays;
                        project.dateEstimatedFormatted = moment(project.dateEstimated).format('ddd, DD MMM');

                        // set passed time, for inactive projects
                        if (
                            project.date &&
                            $scope.filterInactiveStatusOptions.indexOf( project.status ) > -1
                        ) {
                            var passed = TPM.utils.getPassedTime( project.date );
                            project.passedText = passed.textTotal;
                            project.passedDays = Math.abs( Math.round( passed.daysWork ) );
                        }
                    });

                    return arr;
                }

                $scope.deleteProject = function(id) {
                    Projects.delete({ id: id });
                    $scope.projectsList.splice(getProjectIndex(id), 1);
                    feedback.notify('Project was deleted');
                };

                $scope.setFilterStatus = function(filter) {
                    $scope.filterStatus = filter;
                    tpmCache.put('filterStatus', filter);
                };

                $scope.orderCriteria = function() {
                    if ( $scope.filterInactiveStatusOptions.indexOf( $scope.filterStatus ) > -1 ) {
                        return 'passedDays';
                    }

                    return 'remainingDays';
                };
            }
        ])

        .controller('ProjectsViewController', [
            '$scope',
            '$routeParams',
            'ProjectsService',
            function($scope, $routeParams, Projects) {
                Projects.get({ id: $routeParams.id }).$promise.then(function(data) {
                    $scope.project = data;
                    // set remaining time
                    var remaining = TPM.utils.getRemainingWorkTime( data.dateEstimated );
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
            function($scope, $routeParams, $filter, $location, Projects, Clients, SettingsUser, feedback) {

                $scope.formAction = 'Add';
                $scope.formSubmit = $scope.formAction + ' project';
                $scope.dateSettings = dateSettings;
                $scope.selectedDateEstimated = new Date();
                $scope.isDatePickerOpened = false;
                $scope.statusList = TPM.utils.statusList;
                $scope.isNewClient = false;
                $scope.isLoading = false;
                $scope.currency = SettingsUser.get().currency;

                // project model
                $scope.project = {
                    name          : '',
                    clientName    : '',
                    priceEstimated: '',
                    priceFinal    : '',
                    days          : '',
                    status        : TPM.utils.statusList[0],
                    dateEstimated : '',
                    dateAdded     : '',
                    description   : ''
                };

                $scope.clientsList = Clients.query();

                $scope.submitForm = function() {
                    feedback.load();

                    // convert the dates to match the DB format
                    $scope.project.dateEstimated = $filter('date')($scope.selectedDateEstimated, TPM.settings.dateFormat);
                    $scope.project.dateAdded = $filter('date')(new Date(), TPM.settings.dateFormat);
                    $scope.isLoading = true;
                    $scope.formSubmit = 'Please wait ...';

                    Projects.save($scope.project).$promise.then(function() {
                        $location.path('/projects');
                        feedback.notify('Project was added');
                    });
                };

                $scope.openDatePicker = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.isDatePickerOpened = true;
                };

                $scope.clearClient = function() {
                    $scope.project.clientName = '';
                };
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
            function($scope, $q, $routeParams, $filter, $location, Projects, Clients, SettingsUser, feedback) {

                $scope.formAction            = 'Edit';
                $scope.formSubmit            = $scope.formAction + ' project';
                $scope.dateSettings          = dateSettings;
                $scope.selectedDateEstimated = new Date();
                $scope.isDatePickerOpened    = false;
                $scope.statusList            = TPM.utils.statusList;
                $scope.isLoading             = false;
                $scope.currency              = SettingsUser.get().currency;

                $q.all([
                    Projects.get({ id: $routeParams.id }).$promise,
                    Clients.query().$promise
                ]).then(function(data) {

                    $scope.project               = data[0];
                    $scope.clientsList           = data[1];
                    $scope.selectedDateEstimated = $scope.project.dateEstimated;

                });

                $scope.submitForm = function() {
                    feedback.load();

                    // convert the dates to match the DB format
                    $scope.project.dateEstimated = $filter('date')($scope.selectedDateEstimated, TPM.settings.dateFormat);
                    $scope.project.dateAdded     = $filter('date')(new Date(), TPM.settings.dateFormat);
                    $scope.isLoading             = true;
                    $scope.formSubmit            = 'Please wait ...';

                    Projects.update({ id: $routeParams.id }, $scope.project).$promise.then(function() {
                        $location.path('/projects');
                        feedback.notify('Project was updated');
                    });
                };

                $scope.openDatePicker = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.isDatePickerOpened = true;
                };

                $scope.clearClient = function() {
                    $scope.project.clientName = '';
                };

            }
        ]);

}());