import "angular";
import "angular-mocks";
import "public/js/app";
import customMatchers from "public/spec/_matchers";

describe("TPM.Filters", () => {
  beforeEach(angular.mock.module("TPM.Filters"));

  describe("filterByProjectStatus", () => {
    var filter;

    beforeEach(() => {
      inject($injector => {
        filter = $injector.get("$filter")("filterByProjectStatus");
      });
    });

    it("should return empty array, if passed value is not array", () => {
      expect(filter(undefined)).toEqual([]);
    });

    it("should return a filtered by status array", () => {
      var arr = [
        { status: "on hold" },
        { status: "started" },
        { status: "almost done" },
        { status: "finished" },
        { status: "paid" },
        { status: "started" },
        { status: "on hold" }
      ];

      expect(filter(arr, "on hold").length).toBe(2);
      expect(filter(arr, "started").length).toBe(2);
      expect(filter(arr, "").length).toBe(5);
    });
  });

  describe("filterByClientId", () => {
    var filter;
    var arr = [{ idClient: 0 }, { idClient: 1 }, { idClient: 2 }];

    beforeEach(() => {
      inject($injector => {
        filter = $injector.get("$filter")("filterByClientId");
      });
      jasmine.addMatchers(customMatchers);
    });

    it("should return empty array, if passed value is not array", () => {
      expect(filter(undefined)).toEqual([]);
    });

    it('should return true if passed id is "empty" or "null"', () => {
      expect(filter(arr, "")).toEqualDeep(arr);
      expect(filter(arr, null)).toEqualDeep(arr);
    });

    it("should return the client object, by clientId", () => {
      expect(filter(arr, 0)).toEqualDeep([arr[0]]);
      expect(filter(arr, 2)).toEqualDeep([arr[2]]);
    });
  });
});
