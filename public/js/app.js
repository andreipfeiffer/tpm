var TPM = TPM || {};

(function() {

    'use strict';

    TPM = angular.module('tmp', [
        'ngRoute',

        'TPM.AuthControllers',
        'TPM.ProjectsControllers',
        'TPM.ClientsControllers',

        'TPM.Services'
    ]);

    TPM.routesList = {

        // auth
        '/login': {
            templateUrl: 'partials/login.html',
            controller: 'LoginController',
            requireLogin: false
        },

        // projects
        '/projects': {
            templateUrl: 'partials/projects-list.html',
            controller: 'ProjectsListController',
            requireLogin: true
        },
        '/projects/new': {
            templateUrl: 'partials/project-form.html',
            controller: 'ProjectsEditController'
        },
        '/projects/:id': {
            templateUrl: 'partials/project.html',
            controller: 'ProjectsViewController'
        },
        '/projects/:id/edit': {
            templateUrl: 'partials/project-form.html',
            controller: 'ProjectsEditController'
        },

        // clients
        '/clients': {
            templateUrl: 'partials/clients-list.html',
            controller: 'ClientsListController'
        }
    };

    TPM.config(['$routeProvider', function($routeProvider) {

        //this loads up our routes dynamically from the previous object
        for (var path in TPM.routesList) {
            $routeProvider.when(path, TPM.routesList[path]);
        }
        $routeProvider.otherwise({redirectTo: '/login'});

    }]).run(function($rootScope, SessionService){

        $rootScope.$on("$locationChangeStart", function(event, next, current) {

            $rootScope.isAuth = SessionService.getUserAuthenticated();

            for (var i in TPM.routesList) {
                if (next.indexOf(i) != -1) {
                    if (TPM.routesList[i].requireLogin && !SessionService.getUserAuthenticated()) {
                        alert("You need to be authenticated to see this page!");
                        event.preventDefault();
                    }
                }
            }
        });

    });


}());