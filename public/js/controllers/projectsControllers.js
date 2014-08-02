(function() {

    'use strict';

    var dateSettings = {
        dateFormat: 'dd MMMM yyyy',
        dateOptions: {
            formatYear: 'yy',
            startingDay: 1
        }
    };

    // custom validator, that is used with ui.validator
    var isValidName = function(value) {
        var _value = value.trim();
        if ( _value.length < 2 ) return false;
        return true;
    };

    angular.module('TPM.ProjectsControllers', [])

        .controller('ProjectsListController', [
            '$scope',
            '$q',
            '$routeParams',
            'ProjectsService',
            'ClientsService',
            function($scope, $q, $routeParams, Projects, Clients) {

                $scope.filterStatus = '';
                $scope.filterStatusOptions = TPM.utils.statusList;
                $scope.filterActiveStatusOptions = TPM.utils.getActiveStatusList();

                $q.all([
                    Projects.query().$promise,
                    Clients.query().$promise
                ]).then(function(data) {

                    $scope.clientsList = data[1];
                    $scope.projectsList = initProjectsList( data[0] );

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
                        // @todo set on the server !!!
                        if ( !project.idClient ) {
                            project.clientName = '-';
                        } else {
                            project.clientName = getClientById( project.idClient ).name;
                        }

                        // set remaining time
                        var remaining = TPM.utils.getRemainingTime( project.dateEstimated );
                        project.remainingDays = Math.round( remaining.daysWork );
                        project.remainingText = remaining.textTotal;
                        project.remainingWeekendDays = remaining.weekendDays;
                    });

                    return arr;
                }

                $scope.deleteProject = function(id) {
                    Projects.delete({ id: id });
                    $scope.projectsList.splice(getProjectIndex(id), 1);
                };

                $scope.setFilterStatus = function(filter) {
                    $scope.filterStatus = filter;
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
            'ProjectsService',
            'ClientsService',
            'ModalAlertService',
            function($scope, $routeParams, $filter, Projects, Clients, ModalAlert) {

                $scope.formAction = 'Add';
                $scope.formSubmit = $scope.formAction + ' project';
                $scope.dateSettings = dateSettings;
                $scope.selectedDateEstimated = new Date();
                $scope.isDatePickerOpened = false;
                $scope.statusList = TPM.utils.statusList;
                $scope.showQuickClient = true;
                $scope.isNewClient = true;
                $scope.isLoading = false;

                // project model
                $scope.project = {
                    name: '',
                    idClient: 0,
                    newClientName: '',
                    priceEstimated: 0,
                    priceFinal: 0,
                    days: 1,
                    status: TPM.utils.statusList[0],
                    dateEstimated: '',
                    dateAdded: '',
                    description: ''
                };

                $scope.clientsList = Clients.query();

                $scope.submitForm = function() {

                    if ( !$scope.projectsForm.$valid ) {
                        return;
                    }

                    // default value is 'null', so convert it to int
                    $scope.project.idClient = TPM.utils.toInt( $scope.project.idClient );
                    // convert the dates to match the DB format
                    $scope.project.dateEstimated = $filter('date')($scope.selectedDateEstimated, TPM.settings.dateFormat);
                    $scope.project.dateAdded = $filter('date')(new Date(), TPM.settings.dateFormat);
                    $scope.isLoading = true;
                    $scope.formSubmit = 'Please wait ...';

                    Projects.save($scope.project).$promise.then(function() {
                        $scope.modal = ModalAlert.open('/projects');
                    });
                };

                $scope.openDatePicker = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.isDatePickerOpened = true;
                };
                $scope.toggleClientSelect = function() {
                    $scope.isNewClient = !$scope.isNewClient;
                };
                $scope.validateName = function(value) {
                    return isValidName(value);
                };
            }
        ])

        .controller('ProjectsEditController', [
            '$scope',
            '$q',
            '$routeParams',
            '$filter',
            'ProjectsService',
            'ClientsService',
            'ModalAlertService',
            function($scope, $q, $routeParams, $filter, Projects, Clients, ModalAlert) {

                $scope.formAction = 'Edit';
                $scope.formSubmit = $scope.formAction + ' project';
                $scope.dateSettings = dateSettings;
                $scope.selectedDateEstimated = new Date();
                $scope.isDatePickerOpened = false;
                $scope.statusList = TPM.utils.statusList;
                $scope.isLoading = false;

                $q.all([
                    Projects.get({ id: $routeParams.id }).$promise,
                    Clients.query().$promise
                ]).then(function(data) {

                    $scope.project = data[0];
                    $scope.clientsList = data[1];
                    $scope.selectedDateEstimated = $scope.project.dateEstimated;

                });

                $scope.submitForm = function() {

                    if ( !$scope.projectsForm.$valid ) {
                        return;
                    }

                    // default value is 'null', so convert it to int
                    $scope.project.idClient = TPM.utils.toInt( $scope.project.idClient );
                    // convert the dates to match the DB format
                    $scope.project.dateEstimated = $filter('date')($scope.selectedDateEstimated, TPM.settings.dateFormat);
                    $scope.project.dateAdded = $filter('date')(new Date(), TPM.settings.dateFormat);
                    $scope.isLoading = true;
                    $scope.formSubmit = 'Please wait ...';

                    Projects.update({ id: $routeParams.id }, $scope.project).$promise.then(function() {
                        ModalAlert.open('/projects');
                    });
                };

                $scope.openDatePicker = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.isDatePickerOpened = true;
                };
                $scope.validateName = function(value) {
                    return isValidName(value);
                };

            }
        ]);

}());