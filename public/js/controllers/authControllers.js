import angular from 'angular';
import config from 'public/js/appConfig';

export default angular.module('TPM.AuthControllers', [])

    .controller('LoginController', [
        '$scope',
        '$http',
        '$location',
        'SessionService',
        'SettingsUser',
        'feedback',
        function($scope, $http, $location, Session, SettingsUser, feedback) {

            // if user is already authenticated, redirect
            if ( Session.getAuthToken() ) {
                $location.path('/projects');
            }

            $scope.errorMessage = '';
            $scope.isLoading    = false;
            $scope.credentials  = {
                username: '',
                password: ''
            };

            feedback.dismiss();

            $scope.login = function() {
                $scope.isLoading = true;
                feedback.load();

                $http
                    .post(config.getApiUrl() + 'login', $scope.credentials)
                    .success(function (res) {
                        Session.setAuthToken( res.authToken );

                        SettingsUser.fetch().success(function (settings) {
                            SettingsUser.set( settings );
                            $location.path('/projects');
                            feedback.dismiss();
                        });

                    })
                    .error(function (res) {
                        $scope.isLoading = false;
                        feedback.notify(res.error, { type: 'error', sticky: true });
                    });
            };
        }
    ])

    .controller('LogoutController', [
        '$http',
        '$location',
        'SessionService',
        'SettingsUser',
        function($http, $location, Session, SettingsUser) {

            $http
                .get(config.getApiUrl() + 'logout')
                .success(function () {
                    SettingsUser.remove();
                    Session.removeAuthToken();
                    $location.path('/login');
                });
        }
    ]);
