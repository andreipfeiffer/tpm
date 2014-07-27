(function() {

    'use strict';

    angular.module('TPM.ClientsControllers', [])

        .controller('ClientsListController', [
            '$scope',
            'ClientsService',
            function($scope, Clients) {

                $scope.isFormNewDisplayed = false;
                $scope.isFormNewLoading = false;
                $scope.newClient = {
                    name: ''
                };

                $scope.clientsList = Clients.query();

                $scope.toggleNewFormDisplay = function() {
                    $scope.isFormNewDisplayed = !$scope.isFormNewDisplayed;
                };

                $scope.addNewClient = function() {
                    $scope.isFormNewLoading = true;
                    Clients.save( $scope.newClient ).$promise.then(function(result) {
                        $scope.isFormNewLoading = false;
                        $scope.newClient.name = '';
                        $scope.clientsList.push(result);
                    });
                };
            }
        ]);

}());