import config from "public/js/appConfig";

class Projects {
  constructor($http, $resource, $filter) {
    this.$http = $http;
    this.$resource = $resource;
    this.$filter = $filter;
  }

  http() {
    return this.$resource(
      config.getApiUrl() + "projects/:id",
      {
        id: "@id"
      },
      {
        update: { method: "PUT" }
      }
    );
  }

  serialize(scope) {
    return Object.assign({}, scope.project, {
      days: this.getDays(scope),
      dateEstimated: this.getEstimatedDate(scope),
      dateAdded: this.getFormattedDate(new Date())
    });
  }

  getDays(scope) {
    return scope.hasDeadline ? scope.days : 0;
  }

  getEstimatedDate(scope) {
    if (!scope.hasDeadline) {
      return null;
    }
    return this.getFormattedDate(scope.selectedDateEstimated);
  }

  getFormattedDate(date) {
    return this.$filter("date")(date, config.dateFormat);
  }

  getProjectsArchivedCounts() {
    return this.$http.get(config.getApiUrl() + "projects/archived-counts");
  }

  getProjectsInMonth(month) {
    return this.$http.get(config.getApiUrl() + "projects/month/" + month);
  }

  getProjectsByStatus(status, limit) {
    var url = config.getApiUrl() + "projects/status/" + status;

    if (limit) {
      url += "/with-limit";
    }

    return this.$http.get(url);
  }
}
Projects.$inject = ["$http", "$resource", "$filter"];

export default Projects;
