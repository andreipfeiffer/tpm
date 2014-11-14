(function() {

    'use strict';

    angular.module('TPM.SettingsControllers', [])

        .controller('SettingsController', [
            '$scope',
            // 'ngNotify',
            'SettingsService',
            function($scope, /*ngNotify, */Settings) {

                $scope.isLoading = true;

                Settings.get().$promise.then(function(data) {
                    $scope.settings = data;
                    $scope.isLoading = false;
                    console.log(data);
                });

                $scope.revokeGoogleAccess = function() {
                    Settings.delete({ type: 'google' });
                }
            }
        ]);

}());
