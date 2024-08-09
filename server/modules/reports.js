module.exports = (() => {
  "use strict";

  var server = require("../../server"),
    knex = server.knex,
    moment = require("moment");

  function getProjectsReport(idUser, month) {
    var q = "";

    q += "SELECT";
    q += " projects.id,";
    q += " idClient,";
    q += " projects.name,";
    q += " clients.name AS clientName,";
    q += " priceEstimated,";
    q += " priceFinal,";
    q += " date,";
    q += " projects.status,";
    q += ' DATE_FORMAT(filtered_projects.date, "%Y-%m") AS month';

    q +=
      " FROM (SELECT date, idProject FROM projects_status_log WHERE idUser=" +
      idUser +
      ' AND status = "paid" ORDER BY date DESC)';
    q += " AS filtered_projects";

    q += " LEFT JOIN projects";
    q += " ON filtered_projects.idProject = projects.id";

    q += " LEFT JOIN clients";
    q += " ON projects.idClient = clients.id";

    q += " WHERE projects.isDeleted = 0";
    q += " AND projects.status = 'paid'";

    // if we pass a specific month, select only projects from that month
    if (month) {
      q +=
        ' AND DATE_FORMAT(filtered_projects.date, "%Y-%m") = \'' + month + "'";
    }
    q += " GROUP BY filtered_projects.idProject";
    // q += " ORDER BY filtered_projects.date DESC";

    return knex.raw(q);
  }

  function groupByMonth(projects) {
    const result = {};

    const sortedProjectsByDate = projects.sort((a, b) => a.date - b.date);
    const firstProjectDate = sortedProjectsByDate[0];
    const lastProjectDate = sortedProjectsByDate[sortedProjectsByDate.length - 1];

    let currentMonth = getMonthFormat(firstProjectDate.date);
    const lastMonth = getMonthFormat(lastProjectDate.date);
    // console.log({firstProjectDate, lastProjectDate, currentMonth, lastMonth});

    // we iterate month by month, from the first one to the last one
    // because we need to account for empty months, without projects
    while (currentMonth <= lastMonth) {
      const projectsForMonth = projects.filter(p => p.month === currentMonth);

      result[currentMonth] = projectsForMonth.reduce((acc, project) => ({
        count: acc.count + 1,
        total: acc.total + getPrice(project),
      }), {
        count: 0,
        total: 0,
      });

      currentMonth = getMonthFormat(moment(currentMonth).add(1, "month"));
    }

    return result;
  }

  function groupByClient(projects) {
    const result = {};

    projects.forEach(project => {
      if (!result[project.idClient]) {
        result[project.idClient] = {
          name: project.clientName,
          count: 0,
          total: 0
        };
      }

      result[project.idClient].count += 1;
      result[project.idClient].total += getPrice(project);
    });

    return result;
  }

  function getMonthFormat(date) {
    return moment(date).format("YYYY-MM");
  }

  return {
    getAll(req, res) {
      var userLogged = req.user;

      getProjectsReport(userLogged.id).then(data => {
        // don't know why it returns 2 arrays
        // (probably because of the 2 selects in the query)
        var totalsByMonth = groupByMonth(data[0]);
        var totalsByClient = groupByClient(data[0]);

        var totalsByMonthArr = Object.keys(totalsByMonth)
          .sort()
          .map(month => ({
            month: month,
            displayMonth: moment(month + "-01").format("YYYY MMMM"),
            count: totalsByMonth[month].count,
            total: totalsByMonth[month].total
          }));

        var totalsByClientArr = Object.entries(totalsByClient)
          .filter(item => item[0] > 0)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 10)
          .map(item => ({
            id: item[0],
            name: item[1].name,
            count: item[1].count,
            total: item[1].total
          }));

        var countsByClientArr = Object.entries(totalsByClient)
          .filter(item => item[0] > 0)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 10)
          .map(item => ({
            id: item[0],
            name: item[1].name,
            count: item[1].count,
            total: item[1].total
          }));

        return res.send({
          byMonth: totalsByMonthArr,
          totalByClient: totalsByClientArr,
          countsByClient: countsByClientArr
        });
      });
    },

    getByMonth(req, res) {
      var userLogged = req.user;
      var month = req.params.month;

      getProjectsReport(userLogged.id, month).then(data => {
        return res.send(data[0]);
      });
    }
  };

  function getPrice(project) {
    if (project.priceFinal) {
      return project.priceFinal;
    }
    return project.priceEstimated;
  }
})();
