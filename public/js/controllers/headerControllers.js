import angular from 'angular';

export default angular.module('TPM.HeaderControllers', [])

    .controller('MenuController', [
        '$scope',
        '$location',
        'screenSize',
        function($scope, $location, screenSize) {

            $scope.isActive = function (path) {
                return ( $location.path().indexOf( path ) > -1 );
            };

            $scope.collapseMenu = function() {
                screenSize.is('xs') && angular.element('#navbar-toggle').trigger('click');
            };

        }
    ]);
