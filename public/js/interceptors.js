(function() {

    'use strict';

    angular.module('TPM.Interceptors', [])

        .factory('authInterceptor',['$injector', '$location', '$q', function($injector, $location, $q) {
            return {
                responseError: function(rejection) {

                    var feedback = $injector.get('feedback');

                    // server offline
                    if (rejection.status === 0) {
                        feedback.notify('Server is currently offline. Please try again later.', {
                            type: 'error',
                            sticky: true
                        });
                    }

                    // Unauthorized access attempt
                    if (rejection.status === 401 && $location.path() !== '/login') {
                        localStorage.removeItem('TPMtoken');
                        $location.path('/login');
                    }

                    // Server error
                    if (parseInt(rejection.status) >= 500) {
                        $location.path('/error500');
                    }

                    return $q.reject(rejection);
                }
            };
        }])

        .config(['$httpProvider', function($httpProvider) {
            return $httpProvider.interceptors.push('authInterceptor');
        }]);

}());
