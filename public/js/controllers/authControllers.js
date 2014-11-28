(function() {

    'use strict';

    angular.module('TPM.AuthControllers', [])

        .controller('LoginController', [
            '$scope',
            '$http',
            '$location',
            'SessionService',
            'feedback',
            function($scope, $http, $location, Session, feedback) {

                // if user is already authenticated, redirect
                if ( Session.getAuthToken() ) {
                    $location.path('/projects');
                }

                $scope.errorMessage = '';
                $scope.isLoading = false;
                $scope.credentials = {
                    username: '',
                    password: ''
                };

                $scope.login = function() {
                    $scope.isLoading = true;
                    feedback.load();

                    $http
                        .post(TPM.apiUrl + 'login', $scope.credentials)
                        .success(function (res) {
                            Session.setAuthToken( res.authToken );
                            $location.path('/projects');
                            feedback.dismiss();
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
            function($http, $location, Session) {

                $http
                    .get(TPM.apiUrl + 'logout')
                    .success(function () {
                        Session.removeAuthToken();
                        $location.path('/login');
                    });
            }
        ]);

}());