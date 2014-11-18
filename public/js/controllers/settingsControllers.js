(function() {

    'use strict';

    angular.module('TPM.SettingsControllers', [])

        .controller('SettingsController', [
            '$scope',
            '$http',
            // 'ngNotify',
            'SettingsService',
            function($scope, $http, /*ngNotify, */Settings) {

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

                    $http.delete('/auth/google').success(function () {
                        $scope.settings.googleToken = false;
                        $scope.isLoadingGoogle = false;
                    });
                };

                function getSelectedCalendar(id) {
                    var calendar;

                    if ( !$scope.settings.calendars || !$scope.settings.calendars.items ) {
                        return {};
                    }

                    calendar = $scope.settings.calendars.items.filter(function(item) {
                        return item.id === id;
                    });

                    return calendar[0];
                }
            }
        ]);

}());
