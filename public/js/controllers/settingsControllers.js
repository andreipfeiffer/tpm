import angular from 'angular';
import utils from 'public/js/utils';
import config from 'public/js/appConfig';

export default angular.module('TPM.SettingsControllers', [])

    .controller('SettingsController', [
        '$scope',
        '$http',
        'feedback',
        'SettingsService',
        'SettingsUser',
        ($scope, $http, feedback, Settings, SettingsUser) => {

            $scope.isLoading = true;
            $scope.isLoadingGoogle = false;
            $scope.selectedCalendar = {};

            $scope.user = {
                data        : SettingsUser.get(),
                currencyList: utils.currencyList
            };

            feedback.load();

            Settings
                .get({ type: 'google' }).$promise
                .then((data) => {
                    $scope.settings = data;
                    $scope.selectedCalendar = getSelectedCalendar( data.selectedCalendar );
                    $scope.isLoading = false;
                    feedback.dismiss();
                })
                .catch((/*err*/) => {
                    $scope.isLoading = false;
                    feedback.notify('Couldn\'t retrieve your calendars', {
                        type  : 'warn',
                        sticky: true
                    });
                });

            $scope.getGoogleAccess = () => {
                $scope.isLoadingGoogle = true;
            };

            $scope.setCalendar = () => {
                feedback.load();
                $scope.isLoadingGoogle = true;
                Settings.update({ type: 'google', field: $scope.selectedCalendar.id }).$promise.then(() => {
                    $scope.isLoadingGoogle = false;
                    feedback.notify('Your calendar is now syncronized');
                });
            };

            $scope.revokeGoogleAccess = () => {
                $scope.isLoadingGoogle = true;
                feedback.load();

                $http.delete(config.getApiUrl() + 'auth/google').success( () => {
                    $scope.settings.googleToken = false;
                    $scope.isLoadingGoogle = false;
                    feedback.notify('Your Google Calendar is not syncronized anymore');
                });
            };

            $scope.saveUserSettings = () => {
                var settings = $scope.user.data;

                feedback.load();

                Settings.update({ type: 'user' }, settings).$promise.then(() => {
                    SettingsUser.set( settings );
                    feedback.notify('Your settings are saved');
                });
            };

            function getSelectedCalendar(id) {
                var calendar;

                if ( !$scope.settings.calendars || !$scope.settings.calendars.items ) {
                    return {};
                }

                calendar = $scope.settings.calendars.items.filter((item) => {
                    return item.id === id;
                });

                return calendar[0];
            }
        }
    ]);
