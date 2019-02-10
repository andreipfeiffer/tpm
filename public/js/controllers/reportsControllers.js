import angular from "angular";
import moment from "moment";
// import utils from "public/js/utils";

export default angular
  .module("TPM.ReportsControllers", [])

  .controller("ReportsController", [
    "$scope",
    "feedback",
    "Reports",
    "SettingsUser",
    "ProjectsModal",
    "ProjectsClientService",
    (
      $scope,
      feedback,
      Reports,
      SettingsUser,
      ProjectsModal,
      ProjectsClient
    ) => {
      $scope.currency = SettingsUser.get().currency;
      $scope.isLoading = true;
      $scope.report = [];
      $scope.displayedReport = [];
      $scope.chartIncomeByMonth = {
        data: [[0]],
        series: [],
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ]
      };
      $scope.chartIncomeByYear = {
        data: [],
        series: ["any value here, only 1 series"],
        labels: []
      };
      $scope.clientsByTotal = [];
      $scope.clientsByCount = [];

      feedback.load();

      Reports.getCounts().then(report => {
        $scope.report = report.data.byMonth;

        var lastYearsData = getLastYears($scope.report, 3);

        var chartIncomeByMonthData = getIncomeByMonthChartData(lastYearsData);
        $scope.chartIncomeByMonth.data = chartIncomeByMonthData.data;
        $scope.chartIncomeByMonth.series = chartIncomeByMonthData.series;

        var chartIncomeByYearData = getIncomeByYearChartData($scope.report);
        $scope.chartIncomeByYear.data = chartIncomeByYearData.data;
        $scope.chartIncomeByYear.labels = chartIncomeByYearData.labels;

        setDisplayedReport(lastYearsData);

        $scope.clientsByTotal = report.data.totalByClient;
        $scope.clientsByCount = report.data.countsByClient;

        $scope.isLoading = false;

        feedback.dismiss();
      });

      $scope.displayAllYears = () => {
        setDisplayedReport($scope.report);
      };

      $scope.showProjectsByMonth = month => {
        Reports.byMonth(month).then(projects => {
          ProjectsModal.open("Projects for " + month, projects.data);
        });
      };

      $scope.showProjectsByClient = client => {
        ProjectsClient.query({ id: client.id }).$promise.then(data => {
          ProjectsModal.open("Projects for " + client.name, data);
        });
      };

      function setDisplayedReport(data) {
        $scope.displayedReport = data.reverse();
      }

      function getLastYears(data, numberOfYears = 3) {
        const start = moment()
          .startOf("year")
          .subtract(parseInt(numberOfYears, 10) - 1, "years")
          .format("YYYY-MM");

        return data.filter(date => date.month >= start);
      }

      function getIncomeByMonthChartData(months) {
        const result = {
          data: [],
          series: []
        };

        months.forEach(date => {
          var year = date.month.slice(0, 4);

          if (result.series.indexOf(year) === -1) {
            result.series.push(year);
            result.data.push([]);
          }

          result.data[result.series.length - 1].push(date.total);
        });

        // reverse data, so the current year is first
        result.data.reverse();
        result.series.reverse();

        return result;
      }

      function getIncomeByYearChartData(months) {
        const result = {};

        months.forEach(date => {
          var year = date.month.slice(0, 4);

          if (!result[year]) {
            result[year] = 0;
          }

          result[year] += date.total;
        });

        return {
          data: [Object.values(result)],
          labels: Object.keys(result)
        };
      }
    }
  ]);
