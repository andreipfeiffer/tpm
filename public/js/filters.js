import angular from "angular";
import utils from "public/js/utils";

export default angular
  .module("TPM.Filters", [])

  .filter("filterByProjectStatus", () => {
    return (arr, status) => {
      if (!angular.isArray(arr)) {
        return [];
      }

      var _status = status.trim();

      return arr.filter(item => {
        return (() => {
          if (_status.length) {
            // if we pass a specific filter
            return item.status === _status;
          } else {
            // if we don't pass specific filter
            // return only the active statuses
            return utils.getActiveStatusList().indexOf(item.status) > -1;
          }
        })();
      });
    };
  })

  .filter("filterByClientId", () => {
    return (arr, id) => {
      if (!angular.isArray(arr)) {
        return [];
      }

      return arr.filter(item => {
        return (() => {
          // default value, when no filter is seleted, the value is ""
          // when the filter is cleared, the value is null
          if (id === null || id === "") {
            return true;
          } else {
            return parseInt(item.idClient) === parseInt(id);
          }
        })();
      });
    };
  });
