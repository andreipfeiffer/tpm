module.exports = function(connection) {

    'use strict';

    var request = require('request'),
        authGoogle  = require('./authGoogle')( connection ),
        calendar = authGoogle.google.calendar('v3');

    var getCalendars = function(req, res, callback) {
        calendar.calendarList.list({}, function(err, response) {
            if (err) { callback(err, response); return; }
            callback(null, response);
        });
    };

    return {
        getAll: function(req, res) {
            var userLogged = req.user,
                result = {};

            authGoogle.getTokens(userLogged.id, function(err, token/*, refreshToken*/) {
                if (err) { return res.status(503).send({ error: 'Database error'}); }

                result.googleToken = !!token.length;

                if (!result.googleToken) {
                    return res.send(result);
                }

                connection.query('select `googleSelectedCalendar` from `users` where `id`="' + userLogged.id + '" and `isDeleted`="0"', function(err, docs) {
                    if (err) { return res.status(503).send({ error: 'Database error: '}); }

                    result.selectedCalendar = docs[0].googleSelectedCalendar;

                    getCalendars(req, res, function(err, calendars) {
                        if (err) { return res.status(400).send({ error: 'Cannot retrieve calendar list'}); }

                        result.calendars = calendars;
                        res.send(result);
                    });
                });
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
                        connection.query('update `users` set `googleOAuthToken`="", `googleOAuthRefreshToken`="" where `id`="' + userLogged.id + '"', function(err/*, docs*/) {
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
            connection.query('update `users` set `googleSelectedCalendar`="'+req.params.calendarId+'" where `id`="' + userLogged.id + '"', function(err/*, docs*/) {
                if (err) { return res.status(503).send({ error: 'Database error: '}); }

                res.send(true);
            });
        }
    };

};