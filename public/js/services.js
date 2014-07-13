(function() {

    'use strict';

    angular.module('TPM.Services', ['ngResource'])

        .factory('ProjectsService', ['$resource', function($resource) {
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
        }]);

}());
