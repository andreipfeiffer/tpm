(function() {

    'use strict';

    angular.module('TPM.HeaderControllers', [])

        .controller('MenuController', [
            '$scope',
            '$location',
            function($scope, $location) {
                $scope.isActive = function (path) {
                    return ( $location.path().indexOf( path ) > -1 );
                };
            }
        ]);

}());
