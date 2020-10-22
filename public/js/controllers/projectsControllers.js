import angular from "angular";
import moment from "moment";
import utils from "public/js/utils";

// @todo move out !!!!!
const dateSettings = {
  dateFormat: "dd MMMM yyyy",
  dateOptions: {
    formatYear: "yy",
    startingDay: 1,
  },
};

export default angular
  .module("TPM.ProjectsControllers", [])

  .controller("ProjectsListController", [
    "$scope",
    "$q",
    "$routeParams",
    "tpmCache",
    "Projects",
    "Clients",
    "SettingsUser",
    "screenSize",
    "feedback",
    (
      $scope,
      $q,
      $routeParams,
      tpmCache,
      Projects,
      Clients,
      SettingsUser,
      screenSize,
      feedback
    ) => {
      $scope.displayedProjectList = [];
      $scope.projectsList = [];
      $scope.archivedList = {
        paid: {
          list: [],
          count: 0,
        },
        cancelled: {
          list: [],
          count: 0,
        },
      };
      $scope.filterStatus = tpmCache.get("filterStatus") || "";
      $scope.filterStatusOptions = utils.statusList.filter(
        (s) => s !== "paid" && s !== "cancelled"
      );
      $scope.filterActiveStatusOptions = utils.getActiveStatusList();
      $scope.filterInactiveStatusOptions = utils.getInactiveStatusList();
      $scope.filterClient = $routeParams.id || "";
      $scope.currency = SettingsUser.get().currency;

      $scope.isLoading = true;
      $scope.showActions = false;
      $scope.isEnabledToggleActions = screenSize.is("xs");

      !feedback.isActive() && feedback.load();

      $q.all([
        Projects.http().query().$promise,
        Clients.http().query().$promise,
        Projects.getProjectsArchivedCounts(),
      ]).then((data) => {
        $scope.clientsList = data[1];
        $scope.projectsList = initProjectsList(data[0]);
        $scope.archivedList["paid"].count = data[2].data.paid;
        $scope.archivedList["cancelled"].count = data[2].data.cancelled;
        $scope.isLoading = false;
        feedback.isLoading() && feedback.dismiss();
        setDisplayedProjectsList($scope.filterStatus);
      });

      function getClientById(id) {
        var filtered = $scope.clientsList.filter((client) => {
          return client.id === id;
        });

        return filtered[0];
      }

      function getProjectIndex(id) {
        return $scope.projectsList.findIndex((project) => project.id === id);
      }

      function initProjectsList(arr) {
        let currentYear;

        try {
          arr = arr.sort(
            (a, b) => new Date(a.dateEstimated) - new Date(b.dateEstimated)
          );
          currentYear = 0;
        } catch (e) {
          currentYear = null;
        }

        angular.forEach(arr, (project) => {
          project.price =
            project.priceFinal > 0
              ? project.priceFinal
              : project.priceEstimated;

          if (project.status === "paid" || project.status === "cancelled") {
            return;
          }

          // set remaining time, for active projects
          if (project.dateEstimated) {
            let remaining = utils.getRemainingWorkTime(project.dateEstimated);
            project.remainingDays = Math.round(remaining.daysWork);
            project.remainingText = remaining.textTotal;
            project.remainingWeekendDays = remaining.weekendDays;
            project.dateEstimatedFormatted = moment(
              project.dateEstimated
            ).format("DD MMM");

            // used for displaying a separator between years
            if (currentYear === null) {
              project.newYear = false;
            } else {
              const year = moment(project.dateEstimated).format("YYYY");
              project.newYear = currentYear > 0 && currentYear !== year;
              currentYear = year;
            }
          } else {
            project.remainingDays = "-";
            project.remainingText = "no deadline";
            project.remainingWeekendDays = "-";
            project.dateEstimatedFormatted = "";
            project.newYear = false;
          }

          // set clients name
          if (!project.idClient) {
            project.clientName = "-";
          } else {
            project.clientName = getClientById(project.idClient).name;
          }

          // set passed time, for inactive projects
          if (
            project.date &&
            $scope.filterInactiveStatusOptions.indexOf(project.status) > -1
          ) {
            let passed = utils.getPassedTime(project.date);
            project.passedText = passed.textTotal;
            project.passedDays = Math.abs(Math.round(passed.daysWork));
          }
        });

        return arr;
      }

      function getProjectsByStatus(status, limit) {
        return Projects.getProjectsByStatus(status, limit).then(
          (archivedProjects) => {
            $scope.archivedList[status].list = initProjectsList(
              archivedProjects.data
            );
          }
        );
      }

      function getArchivedProjects(status, limit) {
        $scope.isLoading = true;
        feedback.load();

        return getProjectsByStatus(status, limit).then(() => {
          $scope.displayedProjectList = $scope.archivedList[status].list;
          $scope.isLoading = false;
          feedback.dismiss();
        });
      }

      function setDisplayedProjectsList(filter) {
        if (filter === "paid" || filter === "cancelled") {
          // don't fetch data if already loaded
          if ($scope.archivedList[filter].list.length) {
            $scope.displayedProjectList = $scope.archivedList[filter].list;
            return;
          }
          return getArchivedProjects(filter, true);
        }

        $scope.displayedProjectList = $scope.projectsList.filter((p) => {
          if (filter.length) {
            // if we pass a specific filter
            return p.status === filter;
          } else {
            // if we don't pass specific filter
            // return only the active statuses
            return utils.getActiveStatusList().indexOf(p.status) > -1;
          }
        });
      }

      $scope.loadAllProjectsByStatus = (status) => {
        getArchivedProjects(status, false);
      };

      $scope.deleteProject = (id) => {
        Projects.http().delete({ id: id });
        $scope.projectsList.splice(getProjectIndex(id), 1);
        feedback.notify("Project was deleted");
      };

      $scope.setFilterStatus = (filter) => {
        $scope.filterStatus = filter;
        tpmCache.put("filterStatus", filter);
        setDisplayedProjectsList(filter);
      };

      $scope.orderCriteria = () => {
        if (
          $scope.filterInactiveStatusOptions.indexOf($scope.filterStatus) > -1
        ) {
          return "-date";
        }

        return "remainingDays";
      };

      $scope.isProjectAlmostDone = (project) => {
        return project.status === "almost done";
      };

      $scope.isProjectStarted = (project) => {
        return project.status === "started";
      };

      $scope.isProjectOverdue = (project) => {
        if (
          $scope.isProjectAlmostDone(project) ||
          $scope.isProjectStarted(project)
        ) {
          return false;
        }
        return (
          ($scope.filterActiveStatusOptions.indexOf(project.status) > -1 &&
            project.remainingDays < 0) ||
          (project.status === "finished" && project.passedDays > 30)
        );
      };

      $scope.isProjectLate = (project) => {
        if (
          $scope.isProjectAlmostDone(project) ||
          $scope.isProjectStarted(project)
        ) {
          return false;
        }
        return (
          ($scope.filterActiveStatusOptions.indexOf(project.status) > -1 &&
            project.remainingDays <= project.days &&
            project.remainingDays >= 0) ||
          (project.status === "finished" &&
            project.passedDays > 7 &&
            project.passedDays <= 30)
        );
      };

      $scope.hasProjects = () => $scope.projectsList.length;
    },
  ])

  .controller("ProjectsViewController", [
    "$scope",
    "$routeParams",
    "Projects",
    ($scope, $routeParams, Projects) => {
      Projects.http()
        .get({ id: $routeParams.id })
        .$promise.then((data) => {
          $scope.project = data;
          // set remaining time
          var remaining = utils.getRemainingWorkTime(data.dateEstimated);
          $scope.project.remainingDays = remaining.days;
          $scope.project.remainingText = remaining.text;
        });
    },
  ])

  .controller("ProjectsNewController", [
    "$scope",
    "$routeParams",
    "$location",
    "Projects",
    "Clients",
    "SettingsUser",
    "feedback",
    (
      $scope,
      $routeParams,
      $location,
      Projects,
      Clients,
      SettingsUser,
      feedback
    ) => {
      $scope.formAction = "Add";
      $scope.formSubmit = $scope.formAction + " project";
      $scope.dateSettings = dateSettings;
      $scope.selectedDateEstimated = new Date();
      $scope.isDatePickerOpened = false;
      $scope.statusList = utils.statusList;
      $scope.isNewClient = false;
      $scope.isLoading = false;
      $scope.hasDeadline = true;
      $scope.currency = SettingsUser.get().currency;

      // project model
      $scope.project = {
        name: "",
        clientName: "",
        priceEstimated: "",
        priceFinal: "",
        days: "",
        status: utils.statusList[0],
        dateEstimated: "",
        dateAdded: "",
        description: "",
      };

      $scope.clientsList = Clients.http().query();

      $scope.submitForm = () => {
        feedback.load();

        $scope.isLoading = true;
        $scope.formSubmit = "Please wait ...";

        let data = Projects.serialize($scope);

        Projects.http()
          .save(data)
          .$promise.then(() => {
            $location.path("/projects");
            feedback.notify("Project was added");
          });
      };

      $scope.openDatePicker = ($event) => {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.isDatePickerOpened = true;
      };

      $scope.clearClient = () => ($scope.project.clientName = "");
      $scope.toggleDeadline = () => {
        $scope.hasDeadline = !$scope.hasDeadline;
        $scope.hasDeadline && ($scope.isDatePickerOpened = true);
      };
    },
  ])

  .controller("ProjectsEditController", [
    "$scope",
    "$q",
    "$routeParams",
    "$location",
    "Projects",
    "Clients",
    "SettingsUser",
    "feedback",
    (
      $scope,
      $q,
      $routeParams,
      $location,
      Projects,
      Clients,
      SettingsUser,
      feedback
    ) => {
      $scope.formAction = "Edit";
      $scope.formSubmit = $scope.formAction + " project";
      $scope.dateSettings = dateSettings;
      $scope.selectedDateEstimated = new Date();
      $scope.isDatePickerOpened = false;
      $scope.statusList = utils.statusList;
      $scope.isLoading = false;
      $scope.hasDeadline = true;
      $scope.currency = SettingsUser.get().currency;

      $q.all([
        Projects.http().get({ id: $routeParams.id }).$promise,
        Clients.http().query().$promise,
      ]).then((data) => {
        $scope.project = data[0];
        $scope.clientsList = data[1];
        $scope.selectedDateEstimated = $scope.project.dateEstimated;
        $scope.hasDeadline = !!$scope.project.dateEstimated;
      });

      $scope.submitForm = () => {
        feedback.load();
        $scope.isLoading = true;
        $scope.formSubmit = "Please wait ...";

        let data = Projects.serialize($scope);

        Projects.http()
          .update({ id: $routeParams.id }, data)
          .$promise.then(() => {
            $location.path("/projects");
            feedback.notify("Project was updated");
          });
      };

      $scope.openDatePicker = ($event) => {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.isDatePickerOpened = true;
      };

      $scope.clearClient = () => {
        $scope.project.clientName = "";
      };
      $scope.toggleDeadline = () => {
        $scope.hasDeadline = !$scope.hasDeadline;
        $scope.hasDeadline && ($scope.isDatePickerOpened = true);
      };
    },
  ]);
