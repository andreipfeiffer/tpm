(function() {

    'use strict';

    var projectsControllers = angular.module('projectsControllers', []);

    projectsControllers
        
        .controller('ProjectsListController', [
            '$scope',
            'Projects',
            function($scope, Projects) {
                $scope.projectsList = Projects.query();
            }])
        
        .controller('ProjectsViewController', [
            '$scope',
            '$routeParams',
            'Projects',
            function($scope, $routeParams, Projects) {
                $scope.project = Projects.get({ id: $routeParams.id });
            }]);

}());