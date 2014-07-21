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
                $scope.credentials = {
                    username: '',
                    password: ''
                };

                $scope.login = function() {
                    $scope.errorMessage = '';
                    $http
                        .post(TPM.apiUrl + 'login', $scope.credentials)
                        .success(function (res) {
                            Session.setAuthToken( res.authToken );
                            $location.path('/projects');
                        })
                        .error(function (res) {
                            $scope.errorMessage = res.error;
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