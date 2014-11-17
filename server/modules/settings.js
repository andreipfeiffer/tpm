module.exports = function(knex) {

    'use strict';

    var request = require('request'),
        authGoogle  = require('./authGoogle')( knex ),
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

        revokeAccess: function(req, res) {
            var userLogged = req.user;

            knex('users')
                .select('googleOAuthToken as accessToken')
                .where({ id: userLogged.id, isDeleted: '0' })
                .then(function(data) {
                    request.get('https://accounts.google.com/o/oauth2/revoke?token=' + data[0].accessToken, function (err, resGoogle, body) {
                        if (err) { return res.send(err); }

                        return knex('users')
                            .where({ id: userLogged.id })
                            .update({
                                googleOAuthToken: '',
                                googleOAuthRefreshToken: '',
                                googleSelectedCalendar: ''
                            })
                            .then(function() {
                                return res.send(body);
                            });
                    });
                })
                .catch(function(e) {
                    return res.status(503).send({ error: 'Database error: ' + e.code});
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