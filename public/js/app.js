var TPM = TPM || {};

(function() {

    'use strict';

    TPM = angular.module('tmp', [
        'ngRoute',
        'TPM.ProjectsControllers',
        'TPM.ClientsControllers',
        'TPM.Services'
    ]);

    TPM.config(['$routeProvider', function($routeProvider) {

        // @note: if you define the controller here, don't define again in the view
        // @note: this will cause double init, requesting XHR twice

        $routeProvider

            // projects
            .when('/projects', {
                templateUrl: 'partials/projects-list.html',
                controller: 'ProjectsListController'
            })
            .when('/projects/new', {
                templateUrl: 'partials/project-form.html',
                controller: 'ProjectsEditController'
            })
            .when('/projects/:id', {
                templateUrl: 'partials/project.html',
                controller: 'ProjectsViewController'
            })
            .when('/projects/:id/edit', {
                templateUrl: 'partials/project-form.html',
                controller: 'ProjectsEditController'
            })

            // clients
            .when('/clients', {
                templateUrl: 'partials/clients-list.html',
                controller: 'ClientsListController'
            })

            .otherwise({
                redirectTo: '/projects'
            });
    }]);
}());