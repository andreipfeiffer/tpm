import angular from 'angular';

export default angular.module('TPM.HeaderControllers', [])

    .controller('MenuController', [
        '$scope',
        '$location',
        'screenSize',
        ($scope, $location, screenSize) => {

            $scope.isActive = (path) => {
                return ( $location.path().indexOf( path ) > -1 );
            };

            $scope.collapseMenu = function(page) {
                $location.path( page );
                screenSize.is('xs') && angular.element('#navbar-toggle').trigger('click');
            };

        }
    ]);
