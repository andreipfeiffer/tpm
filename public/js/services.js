(function() {

    'use strict';

    angular.module('TPM.Services', ['ngResource'])

        .factory('ProjectsService', ['$http', '$resource', function($http, $resource) {
            return $resource(
                TPM.apiUrl + 'projects/:id',
                {
                    id: '@id'
                },
                {
                    'update': { method:'PUT' }
                }
            );
        }])

        .factory('ClientsService', ['$resource', function($resource) {
            return $resource(
                TPM.apiUrl + 'clients/:id',
                {
                    id: '@id'
                },
                {
                    'update': { method:'PUT' }
                }
            );
        }])

        .factory('SettingsService', ['$resource', function($resource) {
            return $resource(
                TPM.apiUrl + 'settings/:type/:field',
                {
                    type: '@type',
                    field: '@field'
                },
                {
                    'update': { method:'PUT' }
                }
            );
        }])

        .service('SessionService', function($http) {

            this.setAuthToken = function(token) {
                localStorage.setItem('TPMtoken', token);
                $http.defaults.headers.common['Authorization'] = token;
            };

            this.getAuthToken = function() {
                return localStorage.getItem('TPMtoken');
            };

            this.removeAuthToken = function() {
                return localStorage.removeItem('TPMtoken');
            };
        });

}());
