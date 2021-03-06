import "angular";
import "angular-mocks";
import "public/js/app";
import config from "public/js/appConfig";
import customMatchers from "public/spec/_matchers";
import stubs from "public/spec/_stubs";

describe("Clients Controllers", () => {
  beforeEach(angular.mock.module("tpm"));

  describe("ClientsListController", () => {
    var scope, ctrl, $httpBackend, $modal;

    beforeEach(inject((_$httpBackend_, $rootScope, $controller, $uibModal) => {
      $modal = $uibModal;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenGET(/views\//).respond(200);

      scope = $rootScope.$new();
      ctrl = $controller("ClientsListController", { $scope: scope });

      // stub the form methods
      scope.clientsForm = {
        $setPristine() {}
      };

      jasmine.addMatchers(customMatchers);
    }));

    it("should toggle the New Client form", () => {
      expect(scope.isFormNewDisplayed).toBe(false);
      scope.toggleNewFormDisplay();
      expect(scope.isFormNewDisplayed).toBe(true);
    });

    it("should add a new client", () => {
      expect(scope.clientsList.length).toBe(0);

      scope.toggleNewFormDisplay();
      scope.newClient.name = "New client";

      $httpBackend.expectPOST(config.getApiUrl() + "clients").respond(201);
      scope.addNewClient();
      $httpBackend.flush();

      expect(scope.clientsList.length).toBe(1);
      expect(scope.newClient.name).toBe("");
    });

    it("should edit a client", () => {
      var client = stubs.clientsList[0];

      $httpBackend
        .expectGET(config.getApiUrl() + "projects/client/" + client.id)
        .respond(200);
      scope.getProjects(client);
      $httpBackend.flush();

      var newClientData = Object.assign({}, client);
      newClientData.name = "Edited client name";

      $httpBackend
        .expectPUT(config.getApiUrl() + "clients/" + client.id)
        .respond(200);
      scope.editClient(newClientData);
      $httpBackend.flush();

      expect(scope.clientsList[0]).toEqual(newClientData);
    });

    it("should delete a client", () => {
      const CLIENT = stubs.clientsList[0];

      $httpBackend
        .expectGET(config.getApiUrl() + "projects/client/" + CLIENT.id)
        .respond(200);
      scope.getProjects(CLIENT);
      $httpBackend.flush();

      expect(scope.clientsList.length).toEqual(1);
      scope.deleteClient(CLIENT.id);
      expect(scope.clientsList.length).toEqual(0);
    });

    it("should open the edit modal, when id is truthy", () => {
      spyOn($modal, "open").and.returnValue(stubs.fakeModal);
      spyOn(scope, "editClient").and.callFake(() => {});

      scope.openEditDialog(1);
      expect(scope.editClient).toHaveBeenCalled();
    });

    it("should not open the edit modal, when id is 0", () => {
      spyOn($modal, "open").and.returnValue(stubs.fakeModal);
      spyOn(scope, "editClient").and.callFake(() => {});

      scope.openEditDialog(0);
      expect(scope.editClient).not.toHaveBeenCalled();
    });
  });
});
