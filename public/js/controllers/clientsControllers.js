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
        ($scope, $modal, Clients, ProjectsClient, ProjectsModal, screenSize, feedback) => {

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

            Clients.query().$promise.then((data) => {
                $scope.clientsList = data;
                $scope.isLoading   = false;
                feedback.dismiss();
            });

            $scope.toggleNewFormDisplay = () => {
                $scope.isFormNewDisplayed = !$scope.isFormNewDisplayed;
                setTimeout(() => angular.element('#new-client-name').focus(), 10);
            };

            $scope.addNewClient = () => {
                feedback.load();
                $scope.isFormNewLoading = true;
                Clients.save( $scope.newClient ).$promise.then((result) => {
                    $scope.isFormNewLoading = false;
                    $scope.newClient.name   = '';

                    $scope.clientsList.push(result);
                    $scope.clientsForm.$setPristine(true);
                    feedback.notify('Client was added');
                });
            };

            $scope.openEditDialog = (id) => {
                if ( !id ) {
                    return;
                }
                var modalInstance = $modal.open({
                    templateUrl: 'public/views/clients-edit-modal.html',
                    controller : ModalEditClientCtrl,
                    resolve    : {
                        client() {
                            return $scope.clientsList[getClientIndex(id)];
                        }
                    }
                });

                // focus form after modal is opened
                modalInstance.opened.then( () => {
                    setTimeout(() => angular.element('#edit-client-name').focus(), 100);
                });

                modalInstance.result.then( (client) => $scope.editClient(client));

                return modalInstance;
            };

            $scope.showProjects = () => {
                var clientId   = this.client.id,
                    clientName = this.client.name || 'No Client';

                ProjectsClient.query({ id: clientId }).$promise.then((data) => {
                    data.forEach((project) => project.clientName = clientName);
                    ProjectsModal.open( 'Projects for ' + clientName, data );
                });
            };

            $scope.editClient = (client) => {
                feedback.load();
                Clients.update({ id: client.id }, client).$promise.then(() => {
                    $scope.clientsList[getClientIndex(client.id)] = client;
                    feedback.notify('Client was updated');
                });
            };

            $scope.deleteClient = (id) => {
                Clients.delete({ id: id });
                $scope.clientsList.splice(getClientIndex(id), 1);
                feedback.notify('Client was deleted');
            };

            $scope.clearSearch = () => $scope.searchClient = '';

            function getClientIndex(id) {
                return $scope.clientsList.findIndex((client) => client.id === id);
            }

            function ModalEditClientCtrl($scope, $uibModalInstance, client) {
                $scope.client = Object.assign({}, client);
            }
            ModalEditClientCtrl.$inject = ['$scope', '$uibModalInstance', 'client'];
        }
    ]);
