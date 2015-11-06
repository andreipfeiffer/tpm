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
            'screenSize',
            'feedback',
            function($scope, $q, $routeParams, tpmCache, Projects, Clients, screenSize, feedback) {

                $scope.filterStatus = tpmCache.get('filterStatus') || '';
                $scope.filterStatusOptions = TPM.utils.statusList;
                $scope.filterActiveStatusOptions = TPM.utils.getActiveStatusList();
                $scope.filterInactiveStatusOptions = TPM.utils.getInactiveStatusList();
                // $scope.filterClient = tpmCache.get('filterClient') || '';
                $scope.filterClient = $routeParams.id || '';

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

                        // set remaining time, for active projects
                        var remaining = TPM.utils.getRemainingTime( project.dateEstimated );
                        project.remainingDays = Math.round( remaining.daysWork );
                        project.remainingText = remaining.textTotal;
                        project.remainingWeekendDays = remaining.weekendDays;
                        project.dateEstimatedFormatted = moment(project.dateEstimated).format('ddd, DD MMM');

                        // set passed time, for inactive projects
                        if (
                            project.date &&
                            $scope.filterInactiveStatusOptions.indexOf( project.status ) > -1
                        ) {
                            var passed = TPM.utils.getRemainingTime( project.date );
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
                    var remaining = TPM.utils.getRemainingTime( data.dateEstimated );
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
            'feedback',
            function($scope, $routeParams, $filter, $location, Projects, Clients, feedback) {

                $scope.formAction = 'Add';
                $scope.formSubmit = $scope.formAction + ' project';
                $scope.dateSettings = dateSettings;
                $scope.selectedDateEstimated = new Date();
                $scope.isDatePickerOpened = false;
                $scope.statusList = TPM.utils.statusList;
                $scope.isNewClient = false;
                $scope.isLoading = false;

                // project model
                $scope.project = {
                    name          : '',
                    idClient      : 0,
                    newClientName : '',
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

                    // default value is 'null', so convert it to int
                    $scope.project.idClient = TPM.utils.toInt( $scope.project.idClient );
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
                $scope.toggleClientSelect = function(val) {
                    $scope.isNewClient = !!val;
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
            'feedback',
            function($scope, $q, $routeParams, $filter, $location, Projects, Clients, feedback) {

                $scope.formAction            = 'Edit';
                $scope.formSubmit            = $scope.formAction + ' project';
                $scope.dateSettings          = dateSettings;
                $scope.selectedDateEstimated = new Date();
                $scope.isDatePickerOpened    = false;
                $scope.statusList            = TPM.utils.statusList;
                $scope.isLoading             = false;

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

                    // default value is 'null', so convert it to int
                    $scope.project.idClient      = TPM.utils.toInt( $scope.project.idClient );
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

            }
        ]);

}());