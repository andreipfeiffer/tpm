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
        '/logout': {
            controller: 'LogoutController',
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

        //this loads up our routes dynamically from the routes object
        for (var path in TPM.routesList) {
            $routeProvider.when(path, TPM.routesList[path]);
        }
        $routeProvider.otherwise({redirectTo: '/login'});

    }]).run(function($rootScope, $location, SessionService) {

            // simple client authentication method: https://coderwall.com/p/f6brkg
            // @note: another more complex: https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
            $rootScope.$on("$locationChangeStart", function(event, next, current) {

                $rootScope.isAuth = SessionService.getUserAuthenticated();

                for (var i in TPM.routesList) {
                    if (next.indexOf(i) != -1) {
                        if (TPM.routesList[i].requireLogin && !SessionService.getUserAuthenticated()) {
                            $location.path('/login');
                            // event.preventDefault();
                        }
                    }
                }
            });

        }
    );


}());