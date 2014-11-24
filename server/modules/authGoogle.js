module.exports = function(knex) {

    'use strict';

    var passport = require('passport'),
        promise = require('node-promise'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        config = require('../config'),
        google = require('googleapis'),
        calendar = google.calendar('v3'),
        OAuth2 = google.auth.OAuth2,
        oauth2Client = new OAuth2(
            config.google.clientID,
            config.google.clientSecret,
            config.google.redirectURL
        );

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

    function setTokens(accessToken, refreshToken) {
        accessToken && (oauth2Client.credentials['access_token'] = accessToken);
        refreshToken && (oauth2Client.credentials['refresh_token'] = refreshToken);
        google.options({ auth: oauth2Client });
    }

    function getTokens(idUser) {
        return knex('users')
            .select('googleOAuthToken as accessToken', 'googleOAuthRefreshToken as refreshToken')
            .where({
                id: idUser,
                isDeleted: '0'
            });
    }

    function refreshAccessToken(userId, callback) {
        oauth2Client.refreshAccessToken(function(err, tokens) {
            if ( !tokens ) {
                clearTokens(userId).then(function() {
                    callback(null);
                });
                return;
            }

            knex('users')
                .where({ id: userId })
                .update({ googleOAuthToken: tokens['access_token'] })
                .then(function() {
                    callback(tokens['access_token']);
                });
        });
    }

    function clearTokens(userId) {
        return knex('users')
            .where({ id: userId })
            .update({
                googleOAuthToken: '',
                googleOAuthRefreshToken: '',
                googleSelectedCalendar: ''
            });
    }

    function deleteEvents(userId) {
        var d = promise.defer(),
            calendarId,
            requests = [];

        knex('users').select('googleSelectedCalendar as googleCalendar').where({ id: userId }).then(function(data) {
            calendarId = data[0].googleCalendar;

            if (!calendarId.length) {
                return d.resolve(false);
            } else {
                return knex('projects')
                    .select()
                    .where({
                        'idUser': userId,
                        'isDeleted': '0'
                    })
                    .andWhere('googleEventId', '!=', '')
                    .catch(function(e) {
                        console.log(e);
                    });
            }
        }).then(function(data) {

            data.forEach(function(project) {
                requests.push(
                    removeEvent(project.googleEventId, calendarId)
                );
            });

            return promise.all( requests );

        }).then(function() {
            return knex('projects')
                .where({
                    'idUser': userId,
                    'isDeleted': '0'
                })
                .andWhere('googleEventId', '!=', '')
                .update({'googleEventId': ''})
                .catch(function(e) {
                    console.log(e);
                });
        }).then(function(result) {
            d.resolve(result);
        }).catch(function(err) {
            d.reject(err);
        });

        return d.promise;
    }

    function removeEvent(eventId, calendarId) {
        var d = promise.defer();

        var params = {
            calendarId: calendarId,
            eventId: eventId
        };

        calendar.events.delete(params, function(err, response) {
            if (err) {
                return d.reject(err);
            }

            d.resolve(response);
        });

        return d.promise;
    }

    passport.use('google',
        new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.redirectURL,
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
            storeGoogleOAuthToken(req.sessionID, accessToken, refreshToken, function(err, user) {
                setTokens(accessToken, refreshToken);
                done(err, user);
            });
        }
    ));

    return {
        callback: redirectCallback,
        google: google,
        setTokens: setTokens,
        getTokens: getTokens,
        refreshAccessToken: refreshAccessToken,
        revokeAccess: function(req, res) {
            var userLogged = req.user;

            deleteEvents(userLogged.id).then(function() {
                return getTokens(userLogged.id);
            }).then(function(data) {
                oauth2Client.revokeToken(data[0].accessToken, function (err/*, resGoogle, body*/) {
                    if (err) { return res.send(err); }

                    return clearTokens(userLogged.id).then(function() {
                        return res.status(205).end();
                    });
                });
            })/*.catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            })*/;
        }
    };
};