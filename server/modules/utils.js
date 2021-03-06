module.exports = (() => {
  "use strict";

  var server = require("../../server"),
    app = server.app,
    knex = server.knex;

  function logError(o) {
    var _data = typeof o.data !== "undefined" ? JSON.stringify(o.data) : "",
      _error = o.data ? JSON.stringify(o.data) : "no error provided";

    return new Promise((resolve, reject) => {
      knex("error_log")
        .insert({
          idUser: o.idUser || 0,
          source: o.source || "",
          data: _data,
          error: _error
        })
        .then(() => {
          console.error("[tpm_error]: " + new Date().toString());
          console.trace(o);
          resolve();
        })
        .catch(err => {
          console.error(err);
          reject();
        });
    });
  }

  return {
    init() {
      app.on("logError", o => this.logError(o));
    },

    logError(o) {
      return logError(o);
    }
  };
})();
