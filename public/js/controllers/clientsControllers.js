import angular from 'angular';

export default angular.module('TPM.ClientsControllers', [])

    .controller('ClientsListController', [
        '$scope',
        '$uibModal',
        'ClientsService',
        'ProjectsClientService',
        'ProjectsModal',
        'screenSize',
        'feedback',
        function($scope, $modal, Clients, ProjectsClient, ProjectsModal, screenSize, feedback) {

            $scope.isFormNewDisplayed     = false;
            $scope.isFormNewLoading       = false;
            $scope.searchClient           = '';
            $scope.isLoading              = true;
            $scope.isEnabledToggleActions = screenSize.is('xs, sm');
            $scope.showActions            = false;
            $scope.newClient              = {
                name: ''
            };

            feedback.load();

            Clients.query().$promise.then(function(data) {
                $scope.clientsList = data;
                $scope.isLoading   = false;
                feedback.dismiss();
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
                feedback.load();
                $scope.isFormNewLoading = true;
                Clients.save( $scope.newClient ).$promise.then(function(result) {
                    $scope.isFormNewLoading = false;
                    $scope.newClient.name   = '';

                    $scope.clientsList.push(result);
                    $scope.clientsForm.$setPristine(true);
                    feedback.notify('Client was added');
                });
            };

            var ModalEditClientCtrl = function($scope, $uibModalInstance, client) {
                $scope.client = angular.extend({}, client);
            };
            ModalEditClientCtrl.$inject = ['$scope', '$uibModalInstance', 'client'];

            $scope.openEditDialog = function(id) {
                if ( !id ) {
                    return;
                }
                var modalInstance = $modal.open({
                    templateUrl: 'public/views/clients-edit-modal.html',
                    controller : ModalEditClientCtrl,
                    resolve    : {
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

            $scope.showProjects = function() {
                var clientId   = this.client.id,
                    clientName = this.client.name || 'No Client';

                ProjectsClient.query({ id: clientId }).$promise.then(function(data) {
                    data.forEach(function(project) {
                        project.clientName = clientName;
                    });
                    ProjectsModal.open( 'Projects for ' + clientName, data );
                });
            };

            $scope.editClient = function(client) {
                feedback.load();
                Clients.update({ id: client.id }, client).$promise.then(function() {
                    $scope.clientsList[getClientIndex(client.id)] = client;
                    feedback.notify('Client was updated');
                });
            };

            $scope.deleteClient = function(id) {
                Clients.delete({ id: id });
                $scope.clientsList.splice(getClientIndex(id), 1);
                feedback.notify('Client was deleted');
            };

            $scope.clearSearch = function() {
                $scope.searchClient = '';
            };
        }
    ]);
