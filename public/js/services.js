(function() {

    'use strict';

	var tpmServices = angular.module('tpmServices', ['ngResource']);

	tpmServices.factory('Projects', ['$resource', function($resource) {
		return $resource(
			'http://localhost:3000/projects/:id',
			{ id: '@id' }
		);
	}]);
}());
