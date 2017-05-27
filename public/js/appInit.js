import angular from 'angular';
import 'angular-route';
import 'angular-animate';
import routes from 'public/js/appRoutes';
import config from 'public/js/appConfig';

export var appInit = angular.module('appInit', [
    'ngRoute'
]).config([
    '$routeProvider', '$animateProvider', 'ChartJsProvider',
    ($routeProvider, $animateProvider, ChartJs) => {

        //this loads up our routes dynamically from the routes object
        for (var path in routes) {
            $routeProvider.when(path, routes[path]);
        }
        $routeProvider.otherwise({redirectTo: '/login'});

        $animateProvider.classNameFilter(/animate-slideFade/);

        // Configure all charts
        ChartJs.setOptions({
            responsive: true,
            animation : false
        });
        ChartJs.setOptions('Line', {
            colours: ['#1eae32', '#1693f4', '#ed9c1c', '#f72e41', '#c736dd'],
        });
    }
]).run([
    '$rootScope', '$location', '$http', 'AuthToken', 'feedback',
    ($rootScope, $location, $http, AuthToken, feedback) => {

        // simple client authentication method: https://coderwall.com/p/f6brkg
        // @note: another more complex: https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
        $rootScope.$on('$locationChangeStart', (event, next/*, current*/) => {

            $rootScope.isAuth = AuthToken.get();

            for (var i in routes) {
                if (next.indexOf(i) !== -1) {
                    if (routes[i].requireLogin && !AuthToken.get()) {
                        $location.path('/login');
                        // event.preventDefault();
                    }
                }
            }
        });

        $http.defaults.headers.common['Authorization'] = AuthToken.get();

        config.setApiUrl( $location.host(), $location.port() );

        feedback.config({
            duration: 2000,
            type    : 'success',
            sticky  : false
        });

        /*$rootScope.$on('$stateChangeError', function $stateChangeError(event, toState,
            toParams, fromState, fromParams, error) {
            console.group();
            console.error('$stateChangeError', error);
            console.error(error.stack);
            console.info('event', event);
            console.info('toState', toState);
            console.info('toParams', toParams);
            console.info('fromState', fromState);
            console.info('fromParams', fromParams);
            console.groupEnd();
        });*/
    }
]);
