var TPM = TPM || {};

(function() {

    'use strict';

    TPM = angular.module('tpm', [
        'ngRoute',
        'ngTouch',
        'ngAnimate',

        'TPM.AuthControllers',
        'TPM.HeaderControllers',
        'TPM.ProjectsControllers',
        'TPM.ClientsControllers',
        'TPM.SettingsControllers',
        'TPM.ReportsControllers',

        'TPM.Services',
        'TPM.Interceptors',
        'TPM.Filters',
        'TPM.Factories',

        'ui.bootstrap',
        'ui.validate',
        'rt.select2',
        'matchMedia',
        'feedback'
    ]);

    var routes = {

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

        '/projects/client/:name': {
            templateUrl: 'views/projects-list.html',
            controller: 'ProjectsListController',
            requireLogin: true
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

        '/reports': {
            templateUrl: 'views/reports.html',
            controller: 'ReportsController',
            requireLogin: true
        },

        '/settings': {
            templateUrl: 'views/settings.html',
            controller: 'SettingsController',
            requireLogin: true
        }
    };

    TPM.config(['$routeProvider', '$animateProvider', function($routeProvider, $animateProvider) {

        //this loads up our routes dynamically from the routes object
        for (var path in routes) {
            $routeProvider.when(path, routes[path]);
        }
        $routeProvider.otherwise({redirectTo: '/login'});

        $animateProvider.classNameFilter(/animate-slideFade/);

    }]).run(function($rootScope, $location, $http, SessionService, feedback) {

            // simple client authentication method: https://coderwall.com/p/f6brkg
            // @note: another more complex: https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
            $rootScope.$on('$locationChangeStart', function(event, next/*, current*/) {

                $rootScope.isAuth = SessionService.getAuthToken();

                for (var i in routes) {
                    if (next.indexOf(i) !== -1) {
                        if (routes[i].requireLogin && !SessionService.getAuthToken()) {
                            $location.path('/login');
                            // event.preventDefault();
                        }
                    }
                }
            });

            $http.defaults.headers.common['Authorization'] = SessionService.getAuthToken();

            // @todo make this read-only
            var isLocalhost = false;
            if ( $location.host() === 'localhost' || $location.host().indexOf('192.168') > -1 ) {
                isLocalhost = true;
            }

            TPM.apiUrl = isLocalhost ? 'http://' + $location.host() + ':' + $location.port() + '/' : 'http://tpm.upsidedown.ro/';

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