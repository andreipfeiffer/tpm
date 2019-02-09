import "angular";
import "angular-mocks";
import "public/js/app";
import config from "public/js/appConfig";

describe("Interceptors", () => {
  beforeEach(angular.mock.module("tpm"));

  describe("authInterceptor", () => {
    const TOKEN = "abcdef";
    var scope, controller, $httpBackend, location, AuthToken, feedback;

    beforeEach(inject((
      _$httpBackend_,
      _$location_,
      $rootScope,
      $controller,
      _AuthToken_,
      _feedback_
    ) => {
      $httpBackend = _$httpBackend_;
      location = _$location_;
      AuthToken = _AuthToken_;
      feedback = _feedback_;

      scope = $rootScope.$new();
      controller = $controller;

      location.path("/projects");
      AuthToken.set(TOKEN);
    }));

    afterEach(() => {
      AuthToken.remove();
    });

    it('should redirect logged users if they get a request with the status "401"', () => {
      // load a random controller to trigger a request
      $httpBackend.expectGET(config.getApiUrl() + "projects").respond(401);
      controller("ProjectsViewController", { $scope: scope });
      $httpBackend.flush();

      expect(location.path()).toEqual("/login");
      expect(AuthToken.get()).not.toEqual(TOKEN);
    });

    it('should display feedback message for status "5xx"', () => {
      // load a random controller to trigger a request
      $httpBackend.expectGET(config.getApiUrl() + "projects").respond(500);
      controller("ProjectsViewController", { $scope: scope });
      $httpBackend.flush();

      expect(feedback.isActive()).toBe(true);
      expect(feedback.getType()).toEqual("error");
    });

    it('should display feedback message for status "0"', () => {
      // load a random controller to trigger a request
      $httpBackend.expectGET(config.getApiUrl() + "projects").respond(0);
      controller("ProjectsViewController", { $scope: scope });
      $httpBackend.flush();

      expect(feedback.isActive()).toBe(true);
      expect(feedback.getType()).toEqual("error");
      expect(feedback.getMessage()).toContain("offline");
    });
  });
});
