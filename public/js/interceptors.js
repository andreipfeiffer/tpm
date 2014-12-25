(function() {

    'use strict';

    angular.module('TPM.Interceptors', [])

        .factory('authInterceptor',['$injector', '$location', '$q', function($injector, $location, $q) {
            return {
                responseError: function(rejection) {

                    var status = parseInt(rejection.status),
                        feedback = $injector.get('feedback');

                    // server offline
                    if (status === 0) {
                        feedback.notify('Server is currently offline. Please try again later.', {
                            type: 'error',
                            sticky: true
                        });
                    }

                    // Unauthorized access attempt
                    if (status === 401 && $location.path() !== '/login') {
                        localStorage.removeItem('TPMtoken');
                        $location.path('/login');
                    }

                    // Server error
                    if (status >= 500) {
                        feedback.notify('Unexpected server error\nPlease try again later, or contact the app administrator.', {
                            type: 'error',
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

}());
