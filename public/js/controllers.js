(function() {

    'use strict';

    var projectsControllers = angular.module('projectsControllers', []);

    projectsControllers.controller('ProjectsController', ['$scope', 'Projects', function($scope, Projects) {
        $scope.projectsList = Projects.query();
    }]);


	projectsControllers.controller('ProjectController', ['$scope', '$routeParams', 'Projects', function($scope, $routeParams, Projects) {
		$scope.project = Projects.get({ id: $routeParams.id });
	}]);

}());