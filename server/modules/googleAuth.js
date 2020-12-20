module.exports = (() => {
  "use strict";

  var server = require("../../server"),
    knex = server.knex,
    passport = require("passport"),
    GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
    config = require("../../config"),
    projects = require("./projects"),
    googleClient = require("./googleClient");

  function redirectCallback(req, res, next) {
    passport.authenticate("google", (err, user /*, info*/) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("/#settings");
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect("/#settings");
      });
    })(req, res, next);
  }

  function findUserBySession(sessionID) {
    return knex("users").select().where({ sessionID: sessionID, isDeleted: "0" });
  }

  function storeGoogleOAuthToken(sessionID, token, refreshToken, done) {
    findUserBySession(sessionID)
      .then((data) => {
        var user = data[0];
        // refreshToken is provided only on first authentication
        // so we update only if provided
        var refreshTokenField = refreshToken
          ? ', `googleOAuthRefreshToken`="' + refreshToken + '"'
          : "";

        return knex
          .raw(
            'update `users` set `googleOAuthToken`="' +
              token +
              '"' +
              refreshTokenField +
              ' where `id`="' +
              user.id +
              '"',
          )
          .then(() => done(null, user));
      })
      .catch((e) => done(e, false));
  }

  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.redirectURL,
        passReqToCallback: true,
      },
      (req, accessToken, refreshToken, profile, done) => {
        // console.log('session: ' + req.sessionID);
        // console.log('accessToken: ' + accessToken);
        // console.log('refreshToken: ' + refreshToken);
        var user;

        if (accessToken.length && (!refreshToken || !refreshToken.length)) {
          findUserBySession(req.sessionID)
            .then((data) => {
              user = data[0];
              return revokeToken(user.id, accessToken);
            })
            .then(() => {
              setAuthError(user.id);
              done(null, user);
            });
        } else {
          storeGoogleOAuthToken(req.sessionID, accessToken, refreshToken, (err, user) => {
            googleClient.setTokens(accessToken, refreshToken);
            done(err, user);
          });
        }
      },
    ),
  );

  function revokeToken(userId, accessToken) {
    return new Promise((resolve, reject) => {
      googleClient.oauth2Client.revokeToken(accessToken, (err /*, resGoogle, body*/) => {
        if (err) {
          reject(err);
        } else {
          googleClient.clearTokens(userId).then(() => resolve(true));
        }
      });
    });
  }

  function revokeAccess(userLogged) {
    // don't know what this is for
    // googleClient.updateTokens(userLogged);

    return projects
      .removeEvents(userLogged.id)
      .then(() => googleClient.getTokens(userLogged.id))
      .then((data) => revokeToken(userLogged.id, data[0].accessToken));
  }

  function setAuthError(idUser) {
    var log = {
      idUser: idUser,
      source: "googleAuth",
      error: {
        message: "Authentication successfull, but no refresh_token returned",
      },
    };

    server.app.emit("logError", log);
  }

  return {
    callback: redirectCallback,

    // @todo refactor: remove req/res dependencies
    revokeAccess(req, res) {
      var userLogged = req.user;

      return revokeAccess(userLogged)
        .then(() => res.status(205).end())
        .catch((err) => {
          var log = {
            idUser: userLogged.id,
            source: "googleAuth.revokeAccess",
            error: err,
          };

          server.app.emit("logError", log);

          return res.status(205).end();
        });
    },
  };
})();
