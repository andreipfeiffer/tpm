(function() {

    'use strict';

    angular.module('TPM.SettingsControllers', [])

        .controller('SettingsController', [
            '$scope',
            // 'ngNotify',
            'SettingsService',
            function($scope, /*ngNotify, */Settings) {

                $scope.isLoading = true;
                $scope.isLoadingGoogle = false;

                Settings.get().$promise.then(function(data) {
                    $scope.settings = data;
                    $scope.isLoading = false;
                });

                $scope.getGoogleAccess = function() {
                    $scope.isLoadingGoogle = true;
                };

                $scope.revokeGoogleAccess = function() {
                    $scope.isLoadingGoogle = true;
                    Settings.delete({ type: 'google' }).$promise.then(function() {
                        $scope.settings.googleToken = false;
                        $scope.isLoadingGoogle = false;
                    });
                };
            }
        ]);

}());
