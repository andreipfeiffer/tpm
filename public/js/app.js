var TPM = TPM || {};

(function() {

    'use strict';

    TPM = angular.module('tpm', [
        'ngRoute',
        'ngTouch',

        'TPM.AuthControllers',
        'TPM.HeaderControllers',
        'TPM.ProjectsControllers',
        'TPM.ClientsControllers',
        'TPM.SettingsControllers',

        'TPM.Services',
        'TPM.Interceptors',
        'TPM.Filters',
        'TPM.Factories',

        'ui.bootstrap',
        'ui.validate',
        'matchMedia',
        'angular-feedback'
    ]);

    TPM.routesList = {

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

        '/error500': {
            templateUrl: 'views/error5xx.html',
            requireLogin: false
        },

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

        '/clients': {
            templateUrl: 'views/clients-list.html',
            controller: 'ClientsListController',
            requireLogin: true
        },

        '/settings': {
            templateUrl: 'views/settings.html',
            controller: 'SettingsController',
            requireLogin: true
        }
    };

    TPM.config(['$routeProvider', function($routeProvider) {

        //this loads up our routes dynamically from the routes object
        for (var path in TPM.routesList) {
            $routeProvider.when(path, TPM.routesList[path]);
        }
        $routeProvider.otherwise({redirectTo: '/login'});


    }]).run(function($rootScope, $location, $http, SessionService, feedback) {

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

            feedback.config({
                duration: 2000,
                type: 'success',
                sticky: false
            });
        }
    );

}());