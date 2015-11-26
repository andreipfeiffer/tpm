import angular from 'angular';

export default angular.module('TPM.Interceptors', [])

    .factory('authInterceptor',['$injector', '$location', '$q', '$rootScope', function($injector, $location, $q, $rootScope) {
        return {
            responseError: function(rejection) {

                var status       = parseInt(rejection.status),
                    feedback     = $injector.get('feedback'),
                    publicRoutes = ['/login', '/status'],
                    location     = $location.path();

                // server offline
                if (status === 0) {
                    feedback.notify('Server is currently offline. Please try again later.', {
                        type  : 'error',
                        sticky: true
                    });
                }

                // Unauthorized access attempt
                if (status === 401) {
                    // same logic as SessionService.removeAuthToken();
                    // cannot inject the Service, because of a circular dep of $http
                    $rootScope.isAuth = false;
                    localStorage.removeItem('TPMtoken');

                    // redirect to login only if not a public route
                    if ( publicRoutes.indexOf( location ) === -1 ) {
                        $location.path('/login');
                    }
                    if ( location === '/status' ) {
                        return $q.resolve( true );
                    }
                }

                // Server error
                if (status >= 500) {
                    feedback.notify('Unexpected server error\nPlease try again later, or contact the app administrator.', {
                        type  : 'error',
                        sticky: true
                    });
                }

                return $q.reject(rejection);
            }
        };
    }])

    .config(['$httpProvider', function($httpProvider) {
        return $httpProvider.interceptors.push('authInterceptor');
    }]);
