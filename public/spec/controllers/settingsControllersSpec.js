import "angular";
import "angular-mocks";
import "public/js/app";
import config from "public/js/appConfig";

describe("Settings Controllers", () => {
  beforeEach(angular.mock.module("tpm"));

  describe("SettingsController without Google Access", () => {
    var scope, ctrl, $httpBackend;

    beforeEach(inject((_$httpBackend_, $rootScope, $controller) => {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET(config.getApiUrl() + "settings/google").respond({
        googleToken: false
      });

      scope = $rootScope.$new();
      ctrl = $controller("SettingsController", { $scope: scope });
    }));

    it("should setCalendar()", () => {
      $httpBackend.flush();

      const CALENDAR_ID = 2;
      scope.selectedCalendar.id = CALENDAR_ID;
      $httpBackend
        .expectPUT(config.getApiUrl() + "settings/google/" + CALENDAR_ID)
        .respond();

      scope.setCalendar();
      expect(scope.isLoadingGoogle).toBe(true);
      $httpBackend.flush();
      expect(scope.isLoadingGoogle).toBe(false);
    });

    it("should set settings.googleToken", () => {
      $httpBackend.flush();
      expect(scope.settings.googleToken).toBeDefined();
      expect(scope.settings.googleToken).toBe(false);
    });

    it("should set the loader when Google access is requested", () => {
      $httpBackend.flush();
      scope.getGoogleAccess();
      expect(scope.isLoadingGoogle).toBe(true);
    });

    it("should revoke googleToken", () => {
      $httpBackend.flush();
      scope.settings.googleToken = false;

      $httpBackend
        .expectDELETE(config.getApiUrl() + "auth/google")
        .respond(205);
      scope.revokeGoogleAccess();
      $httpBackend.flush();

      expect(scope.settings.googleToken).toBe(false);
    });
  });

  describe("SettingsController with Google Access", () => {
    var scope,
      ctrl,
      $httpBackend,
      calendarsList = {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }]
      };

    beforeEach(inject((_$httpBackend_, $rootScope, $controller) => {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET(config.getApiUrl() + "settings/google").respond({
        googleToken: true,
        calendars: calendarsList,
        selectedCalendar: 1
      });

      scope = $rootScope.$new();
      ctrl = $controller("SettingsController", { $scope: scope });
    }));

    it("should have the selectedCalendar set", () => {
      $httpBackend.flush();
      expect(scope.selectedCalendar).toEqual(calendarsList.items[0]);
    });
  });

  describe("SettingsUser", () => {
    var scope, ctrl, $httpBackend, SettingsUser;

    beforeEach(inject((
      _$httpBackend_,
      $rootScope,
      $controller,
      _SettingsUser_
    ) => {
      SettingsUser = _SettingsUser_;
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET(config.getApiUrl() + "settings/google").respond({
        googleToken: false
      });

      scope = $rootScope.$new();
      ctrl = $controller("SettingsController", { $scope: scope });
    }));

    it("should saveUserSettings()", () => {
      $httpBackend.flush();
      expect(scope.user.data.currency).toEqual("RON");

      scope.user.data.currency = "EUR";

      $httpBackend
        .expectPUT(config.getApiUrl() + "settings/user", scope.user.data)
        .respond(200);
      scope.saveUserSettings();
      $httpBackend.flush();

      expect(SettingsUser.get().currency).toEqual("EUR");
    });
  });
});
