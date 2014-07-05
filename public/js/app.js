(function() {

    // 'use strict';

    var app = angular.module('tmp', []);

    app.controller('ProjectsController', ['$scope', '$http', function($scope, $http) {
        $http
            .get('js/tempData/projects.json')
            .success(function(data) {
                $scope.projectsList = data;
            });
    }]);

}());