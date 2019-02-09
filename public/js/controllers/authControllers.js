import angular from "angular";
import config from "public/js/appConfig";

export default angular
  .module("TPM.AuthControllers", [])

  .controller("LoginController", [
    "$scope",
    "$http",
    "$location",
    "AuthToken",
    "SettingsUser",
    "feedback",
    ($scope, $http, $location, AuthToken, SettingsUser, feedback) => {
      // if user is already authenticated, redirect
      if (AuthToken.get()) {
        $location.path("/projects");
      }

      $scope.errorMessage = "";
      $scope.isLoading = false;
      $scope.credentials = {
        username: "",
        password: ""
      };

      feedback.dismiss();

      $scope.login = () => {
        $scope.isLoading = true;
        feedback.load();

        $http
          .post(config.getApiUrl() + "login", $scope.credentials)
          .success(res => {
            AuthToken.set(res.authToken);

            SettingsUser.fetch().success(settings => {
              SettingsUser.set(settings);
              $location.path("/projects");
              feedback.dismiss();
            });
          })
          .error(res => {
            $scope.isLoading = false;
            feedback.notify(res.error, { type: "error", sticky: true });
          });
      };
    }
  ])

  .controller("LogoutController", [
    "$http",
    "$location",
    "AuthToken",
    "SettingsUser",
    ($http, $location, AuthToken, SettingsUser) => {
      $http.get(config.getApiUrl() + "logout").success(() => {
        SettingsUser.remove();
        AuthToken.remove();
        $location.path("/login");
      });
    }
  ]);
