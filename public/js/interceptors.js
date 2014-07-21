(function() {

    'use strict';

    angular.module('TPM.Interceptors', [])

        .factory('authInterceptor',['$location', '$q', function($location, $q) {
            return {
                responseError: function(rejection) {
                    if (rejection.status === 401 && $location.path() !== '/login') {
                        localStorage.removeItem('TPMtoken');
                        $location.path('/login');
                    }
                    return $q.reject(rejection);
                }
            };
        }])
        .config(['$httpProvider', function($httpProvider) {
            return $httpProvider.interceptors.push('authInterceptor');
        }]);

}());
