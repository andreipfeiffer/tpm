(function() {

    'use strict';

    angular.module('TPM.AuthControllers', [])

        .controller('LoginController', [
            '$scope',
            '$http',
            'SessionService',
            function($scope, $http, Session) {

                $scope.credentials = {
                    username: '',
                    password: ''
                };

                $scope.login = function() {
                    $http
                        .post('/login', $scope.credentials)
                        .success(function (res) {
                            $http.defaults.headers.common['Authorization'] = res.authToken;
                            Session.setUserAuthenticated(true);
                        });
                }
            }
        ])

        .controller('LogoutController', [
            '$scope',
            '$http',
            'SessionService',
            function($scope, $http, Session) {
                $scope.login = function() {
                    $http.defaults.headers.common['Authorization'] = '';
                    $http
                        .post('/logout')
                        .success(function (res) {
                            Session.setUserAuthenticated(false);
                        });
                }
            }
        ]);

}());