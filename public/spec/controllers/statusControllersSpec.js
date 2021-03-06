import "angular";
import "angular-mocks";
import "angular-socket-io-mock";
import "public/js/app";
import config from "public/js/appConfig";

describe("Status Controllers", () => {
  beforeEach(angular.mock.module("tpm"));

  describe("StatusController", () => {
    var scope, ctrl, websocket, $httpBackend;

    beforeEach(inject((
      $rootScope,
      _$httpBackend_,
      $controller,
      _websocket_
    ) => {
      websocket = _websocket_;
      scope = $rootScope.$new();

      // stub missing method before we instantiate the controller
      websocket.removeAllListeners = jasmine.createSpy();

      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET(config.getApiUrl() + "status").respond(true);

      ctrl = $controller("StatusController", { $scope: scope });
    }));

    it('should receive data when "status.get" is emitted', () => {
      expect(scope.status.users).toEqual(0);
      websocket.receive("status.data", { users: 2 });
      expect(scope.status.users).toEqual(2);

      expect(scope.status.projects).toEqual(0);
      websocket.receive("status.data", { projects: 3 });
      expect(scope.status.projects).toEqual(3);

      expect(scope.status.income).toEqual(0);
      websocket.receive("status.data", { income: 11 });
      expect(scope.status.income).toEqual(11);
    });
  });
});
