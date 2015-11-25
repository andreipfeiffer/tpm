(function() {

    'use strict';

    angular.module('TPM.SettingsControllers', [])

        .controller('SettingsController', [
            '$scope',
            '$http',
            'feedback',
            'SettingsService',
            'SettingsUser',
            function($scope, $http, feedback, Settings, SettingsUser) {

                $scope.isLoading = true;
                $scope.isLoadingGoogle = false;
                $scope.selectedCalendar = {};

                $scope.user = {
                    data        : SettingsUser.get(),
                    currencyList: TPM.utils.currencyList
                };

                feedback.load();

                Settings
                    .get({ type: 'google' }).$promise
                    .then(function(data) {
                        $scope.settings = data;
                        $scope.selectedCalendar = getSelectedCalendar( data.selectedCalendar );
                        $scope.isLoading = false;
                        feedback.dismiss();
                    })
                    .catch(function(/*err*/) {
                        $scope.isLoading = false;
                        feedback.notify('Couldn\'t retrieve your calendars', {
                            type  : 'warn',
                            sticky: true
                        });
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

                $scope.saveUserSettings = function() {
                    var settings = $scope.user.data;

                    feedback.load();

                    Settings.update({ type: 'user' }, settings).$promise.then(function() {
                        SettingsUser.set( settings );
                        feedback.notify('Your settings are saved');
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
