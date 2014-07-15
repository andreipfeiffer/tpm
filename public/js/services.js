(function() {

    'use strict';

    angular.module('TPM.Services', ['ngResource'])

        .factory('ProjectsService', ['$http', '$resource', function($http, $resource) {
            return $resource(
                'http://localhost:3000/projects/:id',
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
                'http://localhost:3000/clients/:id',
                {
                    id: '@id'
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
        });

}());
