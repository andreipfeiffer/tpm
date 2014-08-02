(function() {

    'use strict';

    angular.module('TPM.ClientsControllers', [])

        .controller('ClientsListController', [
            '$scope',
            '$modal',
            'ClientsService',
            function($scope, $modal, Clients) {

                $scope.isFormNewDisplayed = false;
                $scope.isFormNewLoading = false;
                $scope.newClient = {
                    name: ''
                };
                $scope.isLoading = true;

                Clients.query().$promise.then(function(data) {
                    $scope.clientsList = data;
                    $scope.isLoading = false;
                });

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
                    setTimeout(function() {
                        angular.element('#new-client-name').focus();
                    }, 10);
                };

                $scope.addNewClient = function() {
                    $scope.isFormNewLoading = true;
                    Clients.save( $scope.newClient ).$promise.then(function(result) {
                        $scope.isFormNewLoading = false;
                        $scope.newClient.name = '';
                        $scope.clientsList.push(result);
                        $scope.clientsForm.$setPristine(true);
                    });
                };

                var ModalInstanceCtrl = function ($scope, $modalInstance, client) {

                    $scope.client = angular.extend({}, client);

                    // method called directly from template
                    // $scope.submit = function () {
                    //     $modalInstance.close($scope.client);
                    // };
                };

                $scope.openEditDialog = function(id) {
                    var modalInstance = $modal.open({
                        templateUrl: 'views/clients-edit-modal.html',
                        controller: ModalInstanceCtrl,
                        resolve: {
                            client: function () {
                                return $scope.clientsList[getClientIndex(id)];
                            }
                        }
                    });

                    // focus form after modal is opened
                    modalInstance.opened.then(function () {
                        setTimeout(function() {
                            angular.element('#edit-client-name').focus();
                        }, 100);
                    });

                    modalInstance.result.then(function (client) {
                        $scope.editClient(client);
                    });

                    return modalInstance;
                };

                $scope.editClient = function(client) {
                    Clients.update({ id: client.id }, client).$promise.then(function() {
                        $scope.clientsList[getClientIndex(client.id)] = client;
                    });
                };

                $scope.deleteClient = function(id) {
                    Clients.delete({ id: id });
                    $scope.clientsList.splice(getClientIndex(id), 1);
                };
            }
        ]);

}());
