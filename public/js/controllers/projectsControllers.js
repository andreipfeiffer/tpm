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
            'ProjectsService',
            'ClientsService',
            function($scope, $q, Projects, Clients) {

                $q.all([
                    Projects.query().$promise,
                    Clients.query().$promise
                ]).then(function(data) {

                    $scope.projectsList = data[0];
                    $scope.clientsList = data[1];

                    setClientNames();
                });

                function getClientById(id) {
                    var filtered = $scope.clientsList.filter(function(client) {
                        return client.id === id;
                    });

                    return filtered[0];
                }

                function setClientNames() {
                    angular.forEach( $scope.projectsList, function(project) {
                        if ( !project.idClient ) {
                            project.clientName = '-';
                        } else {
                            project.clientName = getClientById( project.idClient ).name;
                        }
                    });
                }

                $scope.deleteProject = function(index) {
                    $scope.projectsList[index].$delete();
                    $scope.projectsList.splice(index, 1);
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
            'ProjectsService',
            'ClientsService',
            function($scope, $routeParams, Projects, Clients) {

                $scope.formAction = 'Add';
                $scope.date = dateSettings;
                $scope.isDatePickerOpened = false;
                $scope.project = {
                    name: '',
                    idClient: 0,
                    isCompleted: 'false',
                    date: new Date()
                };

                $scope.clientsList = Clients.query();

                $scope.submitForm = function() {
                    // default value is 'null', so convert it to int
                    $scope.project.idClient = TPM.utils.toInt( $scope.project.idClient );

                    Projects.save($scope.project);
                };

                $scope.openDatePicker = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.isDatePickerOpened = true;
                };

            }
        ])

        .controller('ProjectsEditController', [
            '$scope',
            '$q',
            '$routeParams',
            'ProjectsService',
            'ClientsService',
            function($scope, $q, $routeParams, Projects, Clients) {

                $scope.formAction = 'Edit';
                $scope.date = dateSettings;
                $scope.isDatePickerOpened = false;

                $q.all([
                    Projects.get({ id: $routeParams.id }).$promise,
                    Clients.query().$promise
                ]).then(function(data) {

                    $scope.project = data[0];
                    $scope.clientsList = data[1];

                });

                $scope.submitForm = function() {
                    // default value is 'null', so convert it to int
                    $scope.project.idClient = TPM.utils.toInt( $scope.project.idClient );

                    Projects.update({ id: $routeParams.id }, $scope.project);
                };

                $scope.openDatePicker = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.isDatePickerOpened = true;
                };

            }
        ]);

}());