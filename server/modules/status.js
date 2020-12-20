module.exports = (() => {
  "use strict";

  var server = require("../../server"),
    knex = server.knex,
    io = server.io,
    socket;

  function getTotalUsers() {
    return new Promise((resolve) => {
      knex("users")
        .count("id as nr")
        .where({
          isDeleted: "0",
        })
        .then((users) => resolve(users[0].nr));
    });
  }

  function getTotalProjects() {
    return new Promise((resolve) => {
      knex("projects")
        .count("id as nr")
        .where({
          isDeleted: "0",
        })
        .then((projects) => resolve(projects[0].nr));
    });
  }

  function getTotalIncome() {
    return new Promise((resolve) => {
      knex("projects")
        .select("priceEstimated", "priceFinal")
        .where({
          isDeleted: "0",
          status: "paid",
        })
        .then((projects) => {
          var income = 0;
          projects.forEach((p) => (income += p.priceFinal || p.priceEstimated));
          resolve(income);
        });
    });
  }

  return {
    init() {
      io.on("connection", (_socket) => {
        // store a reference to the socket object
        socket = _socket;

        socket.on("status.get", (/*data*/) => {
          this.updateUsers();
          this.updateProjects();
          this.updateIncome();
        });
      }).on("error", (err) => {
        var log = {
          source: "status.init",
          error: err,
        };
        server.app.emit("logError", log);
      });
    },

    updateUsers() {
      getTotalUsers().then((nr) => {
        socket && socket.emit("status.data", { users: nr });
      });
    },

    updateProjects() {
      getTotalProjects().then((nr) => {
        socket && socket.emit("status.data", { projects: nr });
      });
    },

    updateIncome() {
      getTotalIncome().then((income) => {
        socket && socket.emit("status.data", { income: income });
      });
    },
  };
})();
