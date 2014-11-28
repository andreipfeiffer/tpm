(function() {

    'use strict';

    angular.module('TPM.SettingsControllers', [])

        .controller('SettingsController', [
            '$scope',
            '$http',
            'feedback',
            'SettingsService',
            function($scope, $http, feedback, Settings) {

                $scope.isLoading = true;
                $scope.isLoadingGoogle = false;
                $scope.selectedCalendar = {};

                feedback.load();

                Settings.get().$promise.then(function(data) {
                    $scope.settings = data;
                    $scope.selectedCalendar = getSelectedCalendar( data.selectedCalendar );
                    $scope.isLoading = false;
                    feedback.dismiss();
                });

                $scope.getGoogleAccess = function() {
                    $scope.isLoadingGoogle = true;
                };

                $scope.setCalendar = function() {
                    feedback.load();
                    $scope.isLoadingGoogle = true;
                    Settings.update({ type: 'google', field: $scope.selectedCalendar.id }).$promise.then(function() {
                        $scope.isLoadingGoogle = false;
                        feedback.notify('Your calendar is now syncronized');
                    });
                };

                $scope.revokeGoogleAccess = function() {
                    $scope.isLoadingGoogle = true;
                    feedback.load();

                    $http.delete(TPM.apiUrl + 'auth/google').success(function () {
                        $scope.settings.googleToken = false;
                        $scope.isLoadingGoogle = false;
                        feedback.notify('Your Google Calendar is not syncronized anymore');
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
