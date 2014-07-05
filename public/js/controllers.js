(function() {

    'use strict';

    var projectsControllers = angular.module('projectsControllers', []);

    projectsControllers.controller('ProjectsController', ['$scope', '$http', function($scope, $http) {
        $http
            .get('js/tempData/projects.json')
            .success(function(data) {
                $scope.projectsList = data;
            });
    }]);


	projectsControllers.controller('ProjectController', ['$scope', '$routeParams', function($scope, $routeParams) {
		$scope.projectId = $routeParams.projectId;
	}]);
}());