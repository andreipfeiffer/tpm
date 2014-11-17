module.exports = function(connection, knex) {

    'use strict';

    var request = require('request'),
        authGoogle  = require('./authGoogle')( connection, knex ),
        calendar = authGoogle.google.calendar('v3');

    function getCalendars(req, res, callback) {
        calendar.calendarList.list({}, function(err, response) {
            if (err) { callback(err, response); return; }
            callback(null, response);
        });
    }

    function getSelectedCalendar(idUser) {
        return knex('users').select('googleSelectedCalendar as googleCalendar').where({ id: idUser });
    }

    return {
        getAll: function(req, res) {
            var userLogged = req.user,
                result = {};

            authGoogle.getTokens(userLogged.id).then(function(tokens) {
                result.googleToken = !!tokens[0].accessToken.length;

                if (!result.googleToken) {
                    return res.send(result);
                }

                getSelectedCalendar(userLogged.id).then(function(data) {
                    result.selectedCalendar = data[0].googleCalendar;

                    getCalendars(req, res, function(err, calendars) {
                        if (err) {
                            // @TODO need to revoke access, and ask for re-login
                            // because credentials might be broken
                            // result.calendars = {};
                            return res.status(400).send({ error: err.message});
                        }

                        result.calendars = calendars;
                        res.send(result);
                    });
                });
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        revokeAcces: function(req, res) {
            var userLogged = req.user,
                q;

            q = 'select `googleOAuthToken` from `users` where `id`="' + userLogged.id + '" and `isDeleted`="0"';

            connection.query(q, function(err, docs) {
                if (err) { return res.status(503).send({ error: 'Database error: '}); }

                request.get('https://accounts.google.com/o/oauth2/revoke?token='+docs[0].googleOAuthToken, function (err, resGoogle, body) {
                    if (!err) {
                        connection.query('update `users` set `googleOAuthToken`="", `googleOAuthRefreshToken`="", `googleSelectedCalendar`="" where `id`="' + userLogged.id + '"', function(err/*, docs*/) {
                            if (err) { return res.status(503).send({ error: 'Database error: '}); }

                            res.send(body);
                        });
                    } else {
                        res.send(err);
                    }
                });

            });
        },

        setCalendar: function(req, res) {
            var userLogged = req.user;

            knex('users')
                .where({ id: userLogged.id })
                .update({
                    googleSelectedCalendar: req.params.calendarId
                })
                .then(function() {
                    res.send(true);
                })
                .catch(function(e) {
                    return res.status(503).send({ error: 'Database error: ' + e.code});
                });
        }
    };

};