import angular from "angular";
import config from "public/js/appConfig";

export default angular
  .module("TPM.StatusControllers", [])

  .controller("StatusController", [
    "$scope",
    "$http",
    "feedback",
    "websocket",
    ($scope, $http, feedback, websocket) => {
      $scope.isLoading = true;
      $scope.status = {
        users: 0,
        projects: 0,
        income: 0
      };

      $http.get(config.getApiUrl() + "status");

      feedback.load();

      // @todo without these, the event handles get added
      // everytime I visit the url / init the controller
      websocket.removeAllListeners("status.data");
      websocket.removeAllListeners("error");

      websocket.emit("status.get", {});

      // @todo could have the listeners added only once, at run-time
      websocket.on("status.data", data => {
        feedback.dismiss();
        updateData(data);
        $scope.isLoading = false;
        console.log("on status.data", data);
      });

      websocket.on("error", err => console.warn(err));

      function updateData(data) {
        Object.keys(data).forEach(prop => {
          if (typeof $scope.status[prop] !== "undefined") {
            $scope.status[prop] = data[prop];
          }
        });
      }
    }
  ]);
