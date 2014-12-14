module.exports = function(knex) {

    'use strict';

    var passport = require('passport'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        config = require('../../config'),
        projects = require('./projects')( knex ),
        utils = require('./utils'),
        googleClient = require('./googleClient')( knex );

    function redirectCallback(req, res, next) {
        passport.authenticate('google', function(err, user/*, info*/) {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/#settings'); }
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/#settings');
            });
        })(req, res, next);
    }

    function findUserBySession(sessionID) {
        return knex('users').select().where({ sessionID: sessionID, isDeleted: '0' });
    }

    function storeGoogleOAuthToken(sessionID, token, refreshToken, done) {
        findUserBySession(sessionID).then(function(data) {
            var user = data[0];
            // refreshToken is provided only on first authentication
            // so we update only if provided
            var refreshTokenField = refreshToken ? ', `googleOAuthRefreshToken`="' + refreshToken + '"' : '';

            return knex.raw('update `users` set `googleOAuthToken`="' + token + '"' + refreshTokenField + ' where `id`="' + user.id + '"')
                .then(function() {
                    done(null, user);
                });
        }).catch(function(e) {
            done(e, false);
        });
    }

    passport.use('google',
        new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.redirectURL,
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
            var user;
            if ( accessToken.length && (!refreshToken || !refreshToken.length) ) {
                findUserBySession(req.sessionID).then(function(data) {
                    user = data[0];
                    return setAuthError(user.id);
                }).then(function() {
                    done(null, user);
                });
            } else {
                storeGoogleOAuthToken(req.sessionID, accessToken, refreshToken, function(err, user) {
                    googleClient.setTokens(accessToken, refreshToken);
                    done(err, user);
                });
            }
        }
    ));

    function setAuthError(idUser) {
        var log = {
            idUser: idUser,
            source: 'googleAuth',
            error: { message: 'Authentication successfull, but no refresh_token returned' }
        };

        return utils.logError(log);
    }

    return {
        callback: redirectCallback,

        // @todo refactor: remove req/res dependencies
        revokeAccess: function(req, res) {
            var userLogged = req.user;

            googleClient.updateTokens(userLogged);

            projects.removeEvents(userLogged.id).then(function() {
                return googleClient.getTokens(userLogged.id);
            }).then(function(data) {
                googleClient.oauth2Client.revokeToken(data[0].accessToken, function (err/*, resGoogle, body*/) {
                    if (err) { return res.send(err); }

                    return googleClient.clearTokens(userLogged.id).then(function() {
                        return res.status(205).end();
                    });
                });
            })/*.catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            })*/;
        }
    };
};