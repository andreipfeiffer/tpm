(function() {

    'use strict';

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

        .controller('ProjectsFormController', [
            '$scope',
            '$routeParams',
            'ProjectsService',
            'ClientsService',
            function($scope, $routeParams, Projects, Clients) {

                if ($routeParams.id) {
                    $scope.project = Projects.get({ id: $routeParams.id });
                } else {
                    $scope.project = {
                        name: '',
                        idClient: 0,
                        isCompleted: 'false'
                    };
                }

                $scope.clientsList = Clients.query();

                $scope.submitForm = function() {

                    // default value is 'null', so convert it to int
                    $scope.project.idClient = TPM.utils.toInt( $scope.project.idClient );

                    if ($routeParams.id) {
                        Projects.update({ id: $routeParams.id }, $scope.project);
                    } else {
                        Projects.save($scope.project);
                    }
                };
            }
        ]);

}());