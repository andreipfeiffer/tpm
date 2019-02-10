import "angular";
import "angular-mocks";
import "public/js/app";
import config from "public/js/appConfig";
import customMatchers from "public/spec/_matchers";
import stubs from "public/spec/_stubs";

describe("Reports Controllers", () => {
  beforeEach(angular.mock.module("tpm"));

  describe("ReportsController", () => {
    var scope, ctrl, location, cache, $httpBackend;

    beforeEach(inject((
      _$httpBackend_,
      $rootScope,
      $controller,
      $location,
      tpmCache
    ) => {
      $httpBackend = _$httpBackend_;
      $httpBackend
        .expectGET(config.getApiUrl() + "reports")
        .respond(stubs.reports);
      $httpBackend.whenGET(/views\//).respond(200);

      cache = tpmCache;
      location = $location;
      scope = $rootScope.$new();
      ctrl = $controller("ReportsController", { $scope: scope });

      jasmine.addMatchers(customMatchers);
    }));

    it("should set the response from the API to $scope.projects", () => {
      expect(scope.report).toEqual([]);
      $httpBackend.flush();

      expect(scope.report).toEqualDeep(stubs.reports.byMonth);
    });

    it("should set data for the monthly income chart", () => {
      $httpBackend.flush();

      expect(scope.chartIncomeByMonth.series).toEqual(["2019", "2018"]);
      expect(scope.chartIncomeByMonth.data).toEqual([[200], [100]]);
    });

    it("should set data for the price evolution chart", () => {
      $httpBackend.flush();

      expect(scope.clientsByTotal).toEqual(stubs.reports.totalByClient);
    });
  });
});
