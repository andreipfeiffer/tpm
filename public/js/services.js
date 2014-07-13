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

        .service('SessionService', function() {
            var isUserAuthenticated = false;

            this.setUserAuthenticated = function(value) {
                isUserAuthenticated = value;
            };

            this.getUserAuthenticated = function() {
                return isUserAuthenticated;
            };
        });

}());
