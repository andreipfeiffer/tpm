module.exports = function(knex) {

    'use strict';

    var passport = require('passport'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        config = require('../../config'),
        projects = require('./projects')( knex ),
        googleClient = require('./googleClient')( knex ),
        server = require('../../server'),
        promise = require('node-promise'),
        deferred = promise.defer;

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
            console.log('session: ' + req.sessionID);
            console.log('accessToken: ' + accessToken);
            console.log('refreshToken: ' + refreshToken);
            var user;
            if ( accessToken.length && (!refreshToken || !refreshToken.length) ) {
                findUserBySession(req.sessionID).then(function(data) {
                    user = data[0];
                    return revokeToken(user.id, accessToken);
                }).then(function() {
                    setAuthError(user.id);
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

    function revokeToken(userId, accessToken) {
        var d = deferred();

        googleClient.oauth2Client.revokeToken(accessToken, function (err/*, resGoogle, body*/) {
            if (err) {
                d.reject( err );
            } else {
                googleClient.clearTokens(userId).then(function() {
                    d.resolve( true );
                });
            }
        });

        return d.promise;
    };

    function revokeAccess(userLogged) {
        var d = deferred();

        // don't know what this is for
        // googleClient.updateTokens(userLogged);

        projects.removeEvents(userLogged.id).then(function() {
            return googleClient.getTokens(userLogged.id);
        }).then(function(data) {
            revokeToken(userLogged.id, data[0].accessToken).then(
                function() {
                    d.resolve( true );
                },
                function(err) {
                    d.reject( err );
                }
            );
        })/*.catch(function(e) {
            return res.status(503).send({ error: 'Database error: ' + e.code});
        })*/;

        return d.promise;
    }

    function setAuthError(idUser) {
        var log = {
            idUser: idUser,
            source: 'googleAuth',
            error: { message: 'Authentication successfull, but no refresh_token returned' }
        };
console.log(log);
        server.app.emit('logError', log);
    }

    return {
        callback: redirectCallback,

        // @todo refactor: remove req/res dependencies
        revokeAccess: function(req, res) {
            var userLogged = req.user;

            return revokeAccess(userLogged).then(
                function() {
                    return res.status(205).end();
                },
                function(err) {
                    return res.status(400).send(err);
                }
            );
        }
    };
};