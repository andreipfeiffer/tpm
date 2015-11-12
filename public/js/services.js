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

        .factory('ReportsService', ['$resource', function($resource) {
            return $resource(
                TPM.apiUrl + 'reports'
            );
        }])

        .service('SettingsUser', function($http) {

            this.fetch = function() {
                return $http.get(TPM.apiUrl + 'settings/user');
            };

            this.set = function(data) {
                var defaults = {
                    currency: 'ron'
                };

                var _settings = angular.extend( {}, defaults, data );

                localStorage.setItem('TPMsettings', JSON.stringify( _settings ));
            };

            this.get = function() {
                return JSON.parse( localStorage.getItem('TPMsettings') );
            };

            this.remove = function() {
                return localStorage.removeItem('TPMsettings');
            };
        })

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
