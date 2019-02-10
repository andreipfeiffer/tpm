import config from "public/js/appConfig";

class Reports {
  constructor($http) {
    this.$http = $http;
  }

  getCounts() {
    return this.$http.get(config.getApiUrl() + "reports");
  }

  byMonth(month) {
    return this.$http.get(config.getApiUrl() + "reports/month/" + month);
  }
}
Reports.$inject = ["$http"];

export default Reports;
