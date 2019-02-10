import config from "public/js/appConfig";

class Clients {
  constructor($http, $resource) {
    this.$http = $http;
    this.$resource = $resource;
  }

  http() {
    return this.$resource(
      config.getApiUrl() + "clients/:id",
      {
        id: "@id"
      },
      {
        update: { method: "PUT" }
      }
    );
  }

  search(keyword) {
    return this.$http.get(config.getApiUrl() + "clients/search/" + keyword);
  }
}
Clients.$inject = ["$http", "$resource"];

export default Clients;
