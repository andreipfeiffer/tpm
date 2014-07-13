(function() {

    'use strict';

    var tpmServices = angular.module('tpmServices', ['ngResource']);

    tpmServices.factory('Projects', ['$resource', function($resource) {
        return $resource(
            'http://localhost:3000/projects/:id',
            {
                id: '@id'
            },
            {
                'update': { method:'PUT' }
            }
        );
    }]);

    tpmServices.factory('Clients', ['$resource', function($resource) {
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
