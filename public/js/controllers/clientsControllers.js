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

                function getClientIndex(id) {
                    var index;

                    $scope.clientsList.forEach(function(client, idx) {
                        if (client.id === id) {
                            index = idx;
                        }
                    });

                    return index;
                }

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

                $scope.deleteClient = function(id) {
                    Clients.delete({ id: id });
                    $scope.clientsList.splice(getClientIndex(id), 1);
                };
            }
        ]);

}());