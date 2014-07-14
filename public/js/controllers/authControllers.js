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
                if ( Session.getUserAuthenticated() ) {
                    $location.path('/projects');
                }

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
                            $location.path('/projects');
                        })
                        .error(function (res) {
                            alert(res.error);
                        });
                }
            }
        ])

        .controller('LogoutController', [
            '$http',
            '$location',
            'SessionService',
            function($http, $location, Session) {

                $http
                    .get('/logout')
                    .success(function (res) {
                        $http.defaults.headers.common['Authorization'] = '';
                        Session.setUserAuthenticated(false);
                        $location.path('/login');
                    });
            }
        ]);

}());