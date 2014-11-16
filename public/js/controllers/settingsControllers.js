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
                $scope.selectedCalendar = {};

                Settings.get().$promise.then(function(data) {
                    $scope.settings = data;
                    $scope.selectedCalendar = getSelectedCalendar( data.selectedCalendar );
                    $scope.isLoading = false;
                });

                $scope.getGoogleAccess = function() {
                    $scope.isLoadingGoogle = true;
                };

                $scope.setCalendar = function() {
                    $scope.isLoadingGoogle = true;
                    Settings.update({ type: 'google', field: $scope.selectedCalendar.id }).$promise.then(function() {
                        $scope.isLoadingGoogle = false;
                    });
                };

                $scope.revokeGoogleAccess = function() {
                    $scope.isLoadingGoogle = true;
                    Settings.delete({ type: 'google' }).$promise.then(function() {
                        $scope.settings.googleToken = false;
                        $scope.isLoadingGoogle = false;
                    });
                };

                function getSelectedCalendar(id) {
                    var calendar = $scope.settings.calendars.items.filter(function(item) {
                        return item.id === id;
                    });
                    console.log(id);
                    console.log(calendar);
                    return calendar[0];
                }
            }
        ]);

}());
