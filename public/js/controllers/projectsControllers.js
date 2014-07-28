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
            'ProjectsService',
            'ClientsService',
            function($scope, $q, $routeParams, Projects, Clients) {

                $scope.filterStatus = '';
                $scope.filterStatusOptions = TPM.projectsStatusList;

                $q.all([
                    Projects.query().$promise,
                    Clients.query().$promise
                ]).then(function(data) {

                    $scope.projectsList = data[0];
                    $scope.clientsList = data[1];

                    initProjectsList();
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

                function initProjectsList() {
                    angular.forEach( $scope.projectsList, function(project) {

                        // set clients name
                        if ( !project.idClient ) {
                            project.clientName = '-';
                        } else {
                            project.clientName = getClientById( project.idClient ).name;
                        }

                        // set remaining time
                        var today = moment(),
                            deadline = moment(project.dateEstimated),
                            timeLeft = deadline.diff(today);

                        project.remainingDays = moment.duration(timeLeft, 'ms').asDays();
                        project.remainingText = moment.duration(timeLeft, 'ms').humanize(true);
                    });
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
                $scope.project = Projects.get({ id: $routeParams.id });
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
                $scope.statusList = TPM.projectsStatusList;
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
                    days: 0,
                    status: TPM.projectsStatusList[0],
                    dateEstimated: '',
                    dateAdded: '',
                    description: ''
                };

                $scope.clientsList = Clients.query();

                $scope.submitForm = function() {
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
                $scope.statusList = TPM.projectsStatusList;
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

            }
        ]);

}());