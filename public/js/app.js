var TPM = TPM || {};

(function() {

    'use strict';

    TPM = angular.module('tmp', [
        'ngRoute',
        'projectsControllers'
    ]);

    TPM.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/projects', {
                templateUrl: 'partials/projects.html',
                controller: 'ProjectsController'
            })
            .when('/projects/:projectId', {
                templateUrl: 'partials/project.html',
                controller: 'ProjectController'
            })
            .otherwise({
                redirectTo: '/projects'
            });
    }]);
}());