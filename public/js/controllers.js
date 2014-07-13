(function() {

    'use strict';

    var projectsControllers = angular.module('projectsControllers', []);

    projectsControllers

        .controller('ProjectsListController', [
            '$scope',
            'Projects',
            function($scope, Projects) {
                $scope.projectsList = Projects.query();
            }
        ])

        .controller('ProjectsViewController', [
            '$scope',
            '$routeParams',
            'Projects',
            function($scope, $routeParams, Projects) {
                $scope.project = Projects.get({ id: $routeParams.id });
            }
        ])

        // .controller('ProjectsNewController', [
        //     '$scope',
        //     'Projects',
        //     function($scope, Projects) {
        //         $scope.addProject = function() {
        //             $scope.project = Projects.save();
        //         };
        //     }
        // ])

        .controller('ProjectsEditController', [
            '$scope',
            '$routeParams',
            'Projects',
            'Clients',
            function($scope, $routeParams, Projects, Clients) {

                if ($routeParams.id) {
                    console.log($routeParams.id);
                    $scope.project = Projects.get({ id: $routeParams.id });
                } else {
                    console.log('new');
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
                        console.log($scope.project);
                        Projects.save($scope.project);
                    }
                };
            }
        ]);

}());