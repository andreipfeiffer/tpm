(function() {

    'use strict';

    angular.module('TPM.Services', ['ngResource'])

        .factory('Projects', ['$resource', function($resource) {
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

        .factory('Clients', ['$resource', function($resource) {
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
