(function() {

    'use strict';

    angular.module('TPM.AuthControllers', [])

        .controller('LoginController', [
            '$scope',
            '$http',
            '$location',
            'SessionService',
            function($scope, $http, $location, Session) {

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
                    $scope.errorMessage = '';
                    $scope.isLoading = true;
                    $http
                        .post(TPM.apiUrl + 'login', $scope.credentials)
                        .success(function (res) {
                            Session.setAuthToken( res.authToken );
                            $location.path('/projects');
                        })
                        .error(function (res) {
                            $scope.errorMessage = res.error;
                            $scope.isLoading = false;
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