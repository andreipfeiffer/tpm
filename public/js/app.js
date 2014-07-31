var TPM = TPM || {};

(function() {

    'use strict';

    TPM = angular.module('tpm', [
        'ngRoute',

        'TPM.AuthControllers',
        'TPM.ProjectsControllers',
        'TPM.ClientsControllers',

        'TPM.Services',
        'TPM.Interceptors',
        'TPM.Filters',

        'ui.bootstrap'
    ]);

    TPM.routesList = {

        // auth
        '/login': {
            templateUrl: 'views/login.html',
            controller: 'LoginController',
            requireLogin: false
        },
        '/logout': {
            templateUrl: 'views/logout.html',
            controller: 'LogoutController',
            requireLogin: true
        },

        // errors
        '/error500': {
            templateUrl: 'views/error5xx.html',
            requireLogin: false
        },

        // projects
        '/projects': {
            templateUrl: 'views/projects-list.html',
            controller: 'ProjectsListController',
            requireLogin: true
        },
        '/projects/new': {
            templateUrl: 'views/project-form.html',
            controller: 'ProjectsNewController',
            requireLogin: true
        },
        '/projects/:id': {
            templateUrl: 'views/project.html',
            controller: 'ProjectsViewController',
            requireLogin: true
        },
        '/projects/:id/edit': {
            templateUrl: 'views/project-form.html',
            controller: 'ProjectsEditController',
            requireLogin: true
        },

        // clients
        '/clients': {
            templateUrl: 'views/clients-list.html',
            controller: 'ClientsListController',
            requireLogin: true
        }
    };

    TPM.config(['$routeProvider', function($routeProvider) {

        //this loads up our routes dynamically from the routes object
        for (var path in TPM.routesList) {
            $routeProvider.when(path, TPM.routesList[path]);
        }
        $routeProvider.otherwise({redirectTo: '/login'});

    }]).run(function($rootScope, $location, $http, SessionService) {

            // simple client authentication method: https://coderwall.com/p/f6brkg
            // @note: another more complex: https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
            $rootScope.$on('$locationChangeStart', function(event, next/*, current*/) {

                $rootScope.isAuth = SessionService.getAuthToken();

                for (var i in TPM.routesList) {
                    if (next.indexOf(i) !== -1) {
                        if (TPM.routesList[i].requireLogin && !SessionService.getAuthToken()) {
                            $location.path('/login');
                            // event.preventDefault();
                        }
                    }
                }
            });

            $http.defaults.headers.common['Authorization'] = SessionService.getAuthToken();

            // @todo make this read-only
            TPM.apiUrl = ($location.host() === 'localhost') ? 'http://localhost:' + $location.port() + '/' : 'http://tpm.upsidedown.ro/';
            TPM.settings = {
                dateFormat: 'yyyy-MM-dd'
            };
        }
    );

}());