import angular from "angular";

export default angular
  .module("TPM.ClientsControllers", [])

  .controller("ClientsListController", [
    "$scope",
    "$uibModal",
    "Clients",
    "ProjectsClientService",
    "ProjectsModal",
    "screenSize",
    "feedback",
    "tpmCache",
    (
      $scope,
      $modal,
      Clients,
      ProjectsClient,
      ProjectsModal,
      screenSize,
      feedback,
      tpmCache
    ) => {
      $scope.clientsList = tpmCache.get("clientListSearchResult") || [];
      $scope.projectsList = tpmCache.get("clientListProjects") || [];
      $scope.isFormNewDisplayed = false;
      $scope.isFormNewLoading = false;
      $scope.searchClient =
        ($scope.clientsList[0] && $scope.clientsList[0].name) || "";
      $scope.searchClientOptions = {
        debounce: { default: 300 }
      };
      $scope.isLoading = false;
      $scope.isEnabledToggleActions = screenSize.is("xs");
      $scope.showActions = false;
      $scope.newClient = {
        name: ""
      };

      /*
      feedback.load();

      Clients.http()
        .query()
        .$promise.then(data => {
          $scope.clientsList = data;
          $scope.isLoading = false;
          feedback.dismiss();
        });
      */

      $scope.toggleNewFormDisplay = () => {
        $scope.isFormNewDisplayed = !$scope.isFormNewDisplayed;
        setTimeout(() => angular.element("#new-client-name").focus(), 10);
      };

      $scope.addNewClient = () => {
        feedback.load();
        $scope.isFormNewLoading = true;
        Clients.http()
          .save($scope.newClient)
          .$promise.then(result => {
            $scope.isFormNewLoading = false;
            $scope.newClient.name = "";

            $scope.clientsList.push(result);
            $scope.clientsForm.$setPristine(true);
            feedback.notify("Client was added");
          });
      };

      $scope.openEditDialog = id => {
        if (!id) {
          return;
        }
        var modalInstance = $modal.open({
          templateUrl: "public/views/clients-edit-modal.html",
          controller: ModalEditClientCtrl,
          resolve: {
            client() {
              return $scope.clientsList[getClientIndex(id)];
            }
          }
        });

        // focus form after modal is opened
        modalInstance.opened.then(() => {
          setTimeout(() => angular.element("#edit-client-name").focus(), 100);
        });

        modalInstance.result.then(client => $scope.editClient(client));

        return modalInstance;
      };

      $scope.searchClients = keyword => {
        feedback.load();
        return Clients.search(keyword).then(res => {
          feedback.dismiss();
          return res.data;
        });
      };

      $scope.getProjects = client => {
        feedback.load();
        return ProjectsClient.query({ id: client.id }).$promise.then(data => {
          feedback.dismiss();
          setResults(client, data);
        });
      };

      /*
      $scope.showProjects = clientId => {
        var clientName = getClientById(clientId).name || "No Client";

        ProjectsClient.query({ id: clientId }).$promise.then(data => {
          data.forEach(project => (project.clientName = clientName));
          ProjectsModal.open("Projects for " + clientName, data);
        });
      };
      */

      $scope.editClient = client => {
        feedback.load();
        Clients.http()
          .update({ id: client.id }, client)
          .$promise.then(() => {
            $scope.clientsList[getClientIndex(client.id)] = client;
            feedback.notify("Client was updated");
          });
      };

      $scope.deleteClient = id => {
        Clients.http().delete({ id: id });
        $scope.clientsList.splice(getClientIndex(id), 1);
        feedback.notify("Client was deleted");
      };

      $scope.hasClients = () => $scope.clientsList.length > 0;
      $scope.clearSearch = () => setResults(undefined, []);

      function getClientIndex(id) {
        return $scope.clientsList.findIndex(client => client.id === id);
      }

      /*
      function getClientById(id) {
        return $scope.clientsList[getClientIndex(id)];
      }
      */

      function ModalEditClientCtrl($scope, $uibModalInstance, client) {
        $scope.client = Object.assign({}, client);
      }
      ModalEditClientCtrl.$inject = ["$scope", "$uibModalInstance", "client"];

      function setResults(client, projects) {
        var clientList = client ? [client] : [];

        $scope.searchClient = client ? client.name : "";
        $scope.clientsList = clientList;
        $scope.projectsList = projects;
        tpmCache.put("clientListSearchResult", clientList);
        tpmCache.put("clientListProjects", projects);
      }
    }
  ]);
