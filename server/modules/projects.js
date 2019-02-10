module.exports = (() => {
  "use strict";

  const STATUS_ON_HOLD = "on hold";
  const STATUS_STARTED = "started";
  const STATUS_ALMOST_DONE = "almost done";
  const STATUS_FINISHED = "finished";
  const STATUS_PAID = "paid";
  const STATUS_CANCELLED = "cancelled";

  var server = require("../../server"),
    knex = server.knex,
    moment = require("moment"),
    googleCalendar = require("./googleCalendar"),
    googleClient = require("./googleClient"),
    status = require("./status"),
    clients = require("./clients"),
    statusArr = [
      STATUS_ON_HOLD,
      STATUS_STARTED,
      STATUS_ALMOST_DONE,
      STATUS_FINISHED,
      STATUS_PAID,
      STATUS_CANCELLED
    ],
    statusArrActive = [STATUS_ON_HOLD, STATUS_STARTED, STATUS_ALMOST_DONE],
    statusArrInactive = [STATUS_FINISHED, STATUS_PAID],
    statusArrDefault = [
      STATUS_ON_HOLD,
      STATUS_STARTED,
      STATUS_ALMOST_DONE,
      STATUS_FINISHED
    ];

  function getProjectById(id, idUser) {
    return knex("projects")
      .select("projects.*", "clients.name AS clientName")
      .leftJoin("clients", "projects.idClient", "clients.id")
      .where({
        "projects.id": id,
        "projects.idUser": idUser,
        "projects.isDeleted": "0"
      });
  }

  function getAllProjects(idUser, status, limit) {
    var q = "";

    q += "SELECT";
    q += " projects.*, status_log.date";

    q += " FROM projects";

    q +=
      " LEFT JOIN (SELECT date, idProject, status FROM projects_status_log ORDER BY date DESC)";
    q += " AS status_log";
    q += " ON projects.id = status_log.idProject";
    q += " AND projects.status = status_log.status";

    q += " WHERE projects.idUser = " + idUser;
    q += " AND projects.isDeleted = 0";

    q += getStatusQuery(status);
    q += getLimitQuery(limit);
    q += " GROUP BY status_log.idProject";

    return knex.raw(q);
  }

  function getStatusQuery(status) {
    if (statusArr.indexOf(status) > -1) {
      return ' AND projects.status = "' + status + '"';
    }
    return ' AND projects.status IN ("' + statusArrDefault.join('", "') + '")';
  }

  function getLimitQuery(limit) {
    if (!limit) {
      return "";
    }

    return (
      ' AND status_log.date >= "' +
      moment()
        .subtract(30, "days")
        .toISOString() +
      '"'
    );
  }

  function logStatusChange(idUser, idProject, status) {
    return knex("projects_status_log").insert({
      idUser: idUser,
      idProject: idProject,
      status: status
    });
  }

  function getActiveProjects(userId) {
    return knex("projects")
      .select()
      .where({
        idUser: userId,
        isDeleted: "0"
      })
      .andWhere("googleEventId", "!=", "")
      .catch(function(e) {
        console.log(e);
      });
  }

  function getProjectsByClientId(idUser, idClient) {
    return knex("projects")
      .select("projects.*", "clients.name AS clientName")
      .leftJoin("clients", "projects.idClient", "clients.id")
      .where({
        "projects.idUser": idUser,
        "projects.idClient": idClient,
        "projects.isDeleted": "0"
      })
      .catch(function(e) {
        console.log(e);
      });
  }

  function isStatusActive(status) {
    return statusArrActive.indexOf(status) > -1;
  }

  function isStatusInactive(status) {
    return statusArrInactive.indexOf(status) > -1;
  }

  function hasStatusChangedToInactive(newStatus, oldStatus) {
    if (newStatus === oldStatus) {
      return false;
    }
    if (!isStatusActive(oldStatus) || !isStatusInactive(newStatus)) {
      return false;
    }
    return true;
  }

  function getProjectData(idUser, data) {
    var projectData = {
      idClient: 0,
      name: data.name,
      status: statusArr.indexOf(data.status) > -1 ? data.status : statusArr[0],
      days: parseInt(data.days) || 0,
      priceEstimated: parseInt(data.priceEstimated) || 0,
      priceFinal: parseInt(data.priceFinal) || 0,
      // dateAdded     : data.dateAdded,
      dateEstimated: data.dateEstimated,
      description: data.description
    };

    // add fields for New Project
    if (!parseInt(data.id)) {
      projectData.idUser = idUser;
      projectData.dateAdded = data.dateAdded;
    }

    return new Promise(resolve => {
      getClientId(idUser, data).then(idClient => {
        projectData.idClient = idClient;
        resolve(projectData);
      });
    });
  }

  function getClientId(idUser, data) {
    return new Promise(resolve => {
      clients.getByName(data.clientName, idUser).then(client => {
        if (client.length) {
          // client is found, so we set its id
          resolve(client[0].id);
        } else {
          if (data.clientName && data.clientName.trim().length) {
            // client is not found, but the clientName was filled
            // we add the new client, and set the new client id
            clients.addNew(idUser, data.clientName).then(client => {
              resolve(client[0]);
            });
          } else {
            // client is not found, and clientName was not filled
            // we set "no client"
            resolve(0);
          }
        }
      });
    });
  }

  function editProject(id, idUser, data) {
    return knex("projects")
      .where({
        id: id,
        idUser: idUser,
        isDeleted: "0"
      })
      .update(data);
  }

  function setGoogleEvent(idUser, oldData, editData) {
    var eventId = oldData.googleEventId,
      oldStatus = oldData.status,
      newStatus = editData.status;

    if (googleCalendar.doesEventExists(eventId)) {
      if (hasStatusChangedToInactive(newStatus, oldStatus)) {
        // update the editData, so the eventId will be removed
        editData.googleEventId = "";
        return googleCalendar.deleteEvent(idUser, eventId);
      } else {
        return googleCalendar.updateEvent(idUser, eventId, editData);
      }
    } else if (isStatusActive(newStatus)) {
      return googleCalendar
        .getSelectedCalendarId(idUser)
        .then(calendarId =>
          googleCalendar.addEvent(idUser, editData, calendarId)
        )
        .then(newEventId =>
          googleCalendar.setEventId(idUser, oldData.id, newEventId)
        );
    }
  }

  function softDeleteProject(id, userId) {
    return knex("projects")
      .where({
        id: id,
        idUser: userId,
        isDeleted: "0"
      })
      .update({
        isDeleted: "1",
        googleEventId: ""
      });
  }

  function errorHandler(e, res, userId, method) {
    var log = {
      idUser: userId,
      source: method,
      error: e
    };
    server.app.emit("logError", log);
    return res.status(503).send({ error: "Database error: " + e.code });
  }

  return {
    getAll(req, res) {
      var userLogged = req.user;

      getAllProjects(userLogged.id)
        .then(data => res.send(data[0]))
        .catch(e => errorHandler(e, res, userLogged.id, "projects.getAll"));
    },

    getByStatus(req, res) {
      var userLogged = req.user;
      var status = req.params.status;
      var limit = !!req.params.limit;

      getAllProjects(userLogged.id, status, limit)
        .then(data => res.send(data[0]))
        .catch(e =>
          errorHandler(e, res, userLogged.id, "projects.getByStatus")
        );
    },

    getArchivedCounts(req, res) {
      var userLogged = req.user;

      Promise.all([
        getAllProjects(userLogged.id, STATUS_PAID),
        getAllProjects(userLogged.id, STATUS_CANCELLED)
      ])
        .then(data => {
          return res.send({
            paid: data[0][0].length,
            cancelled: data[1][0].length
          });
        })
        .catch(e =>
          errorHandler(e, res, userLogged.id, "projects.getArchivedCounts")
        );
    },

    getByClientId(req, res) {
      var idClient = req.params.id,
        userLogged = req.user;

      getProjectsByClientId(userLogged.id, idClient)
        .then(data => res.send(data))
        .catch(e => {
          var log = {
            idUser: userLogged.id,
            source: "projects.getByClientId",
            error: e
          };
          server.app.emit("logError", log);
          return res.status(503).send({ error: "Database error: " + e.code });
        });
    },

    getById(req, res) {
      var id = req.params.id,
        userLogged = req.user;

      getProjectById(id, userLogged.id)
        .then(data => {
          if (!data.length) {
            return res.status(404).send({ error: "Record not found" });
          }
          return res.send(data[0]);
        })
        .catch(e => {
          var log = {
            idUser: userLogged.id,
            source: "projects.getById",
            error: e
          };
          server.app.emit("logError", log);
          return res.status(503).send({ error: "Database error: " + e.code });
        });
    },

    update(req, res) {
      var id = parseInt(req.params.id, 10),
        userLogged = req.user,
        newStatus,
        oldStatus,
        editData;

      googleClient.updateTokens(req.user);

      getProjectData(userLogged.id, req.body)
        .then(data => {
          editData = data;
          newStatus = editData.status;
          return getProjectById(id, userLogged.id);
        })
        .then(oldData => {
          oldStatus = oldData[0].status;
          return setGoogleEvent(userLogged.id, oldData[0], editData);
        })
        .then(() => {
          editProject(id, userLogged.id, editData)
            .then(() => {
              if (oldStatus !== newStatus) {
                // emit websocket event
                status.updateIncome();
                logStatusChange(userLogged.id, id, newStatus).then(() =>
                  res.send(true)
                );
              } else {
                return res.send(true);
              }
            })
            .catch(e => {
              var log = {
                idUser: userLogged.id,
                source: "projects.update",
                data: req.body,
                error: e
              };
              server.app.emit("logError", log);
              return res
                .status(503)
                .send({ error: "Database error: " + e.code });
            });
        });
    },

    add(req, res) {
      var data = req.body,
        userLogged = req.user,
        newProject = {},
        newProjectData;

      googleClient.updateTokens(req.user);

      getProjectData(userLogged.id, data)
        .then(data => {
          newProjectData = data;
          return knex("projects").insert(newProjectData);
        })
        .then(newProjectId => {
          // emit websocket event
          status.updateProjects();
          return getProjectById(newProjectId, userLogged.id);
        })
        .then(project => {
          newProject = project[0];
          if (isStatusActive(newProjectData.status)) {
            return googleCalendar.addEvent(userLogged.id, newProjectData);
          }
        })
        .then(eventId =>
          googleCalendar.setEventId(userLogged.id, newProject.id, eventId)
        )
        .then(() =>
          logStatusChange(userLogged.id, newProject.id, req.body.status)
        )
        .then(() => res.status(201).send(newProject))
        .catch(err => {
          var log = {
            idUser: userLogged.id,
            source: "projects.add",
            data: req.body,
            error: err
          };
          server.app.emit("logError", log);
          return res.status(503).send({ error: "Error: " + err.code });
        });
    },

    remove(req, res) {
      var id = parseInt(req.params.id, 10),
        userLogged = req.user;

      googleClient.updateTokens(req.user);

      getProjectById(id, userLogged.id)
        .then(data =>
          googleCalendar.deleteEvent(userLogged.id, data[0].googleEventId)
        )
        .then(() => softDeleteProject(id, userLogged.id))
        .then(() => {
          // emit websocket event
          status.updateProjects();
          return res.status(204).end();
        })
        .catch(e => {
          var log = {
            idUser: userLogged.id,
            source: "projects.remove",
            error: e
          };
          server.app.emit("logError", log);
          return res.status(503).send({ error: "Database error: " + e.code });
        });
    },

    removeEvents(userId) {
      return new Promise((resolve, reject) => {
        let calendarId;

        googleCalendar
          .getSelectedCalendarId(userId)
          // @todo refactor extract method
          .then(id => {
            return new Promise(resolve => {
              calendarId = id;

              if (!calendarId.length) {
                resolve(false);
              } else {
                getActiveProjects(userId).then(projects => resolve(projects));
              }
            });
          })
          .then(projects => googleCalendar.removeEvents(projects, calendarId))
          .then(() => googleCalendar.clearEvents(userId))
          .then(result => resolve(result))
          .catch(err => reject(err));
      });
    }
  };
})();
