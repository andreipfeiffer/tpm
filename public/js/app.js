var TPM = TPM || {};

(function() {

    'use strict';

    TPM = angular.module('tmp', [
        'ngRoute',
        'projectsControllers',
        'tpmServices'
    ]);

    TPM.config(['$routeProvider', function($routeProvider) {

        // @note: if you define the controller here, don't define again in the view
        // @note: this will cause double init, requesting XHR twice

        $routeProvider
            .when('/projects', {
                templateUrl: 'partials/projects-list.html',
                controller: 'ProjectsListController'
            })
            .when('/projects/new', {
                templateUrl: 'partials/project.html',
                controller: 'ProjectNewController'
            })
            .when('/projects/:id', {
                templateUrl: 'partials/project.html',
                controller: 'ProjectsViewController'
            })
            .when('/projects/:id/edit', {
                templateUrl: 'partials/project-form.html',
                controller: 'ProjectsEditController'
            })
            .otherwise({
                redirectTo: '/projects'
            });
    }]);
}());