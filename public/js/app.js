var TPM = TPM || {};

(function() {

    'use strict';

    TPM = angular.module('tmp', [
        'ngRoute',
        'projectsControllers',
        'tpmServices'
    ]);

    TPM.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/projects', {
                templateUrl: 'partials/projects.html',
                controller: 'ProjectsController'
            })
            .when('/projects/:id', {
                templateUrl: 'partials/project.html',
                controller: 'ProjectController'
            })
            .otherwise({
                redirectTo: '/projects'
            });
    }]);
}());