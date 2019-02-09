import angular from "angular";
import config from "public/js/appConfig";
import AuthToken from "public/js/components/AuthToken";
import SettingsUser from "public/js/components/SettingsUser";
import ProjectsModal from "public/js/components/ProjectsModal";
import Projects from "public/js/components/Projects";
import Clients from "public/js/components/Clients";

export default angular
  .module("TPM.Services", ["ngResource"])

  .factory("ProjectsClientService", [
    "$resource",
    $resource => {
      return $resource(config.getApiUrl() + "projects/client/:id", {
        id: "@id"
      });
    }
  ])

  .factory("SettingsService", [
    "$resource",
    $resource => {
      return $resource(
        config.getApiUrl() + "settings/:type/:field",
        {
          type: "@type",
          field: "@field"
        },
        {
          update: { method: "PUT" }
        }
      );
    }
  ])

  .factory("ReportsService", [
    "$resource",
    $resource => {
      return $resource(config.getApiUrl() + "reports");
    }
  ])

  .service("Projects", Projects)
  .service("Clients", Clients)

  .service("SettingsUser", SettingsUser)
  .service("ProjectsModal", ProjectsModal)
  .service("AuthToken", AuthToken);
