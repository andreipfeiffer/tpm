module.exports = function(knex) {

    'use strict';

    var authGoogle = require('./authGoogle')( knex ),
        googleCalendar = require('./calendarGoogle')( knex );

    return {
        getAll: function(req, res) {
            var userLogged = req.user,
                result = {};

            authGoogle.getTokens(userLogged.id).then(function(tokens) {
                result.googleToken = !!tokens[0].accessToken.length;

                if (!result.googleToken) {
                    return res.send(result);
                }

                googleCalendar.getSelectedCalendarId(userLogged.id).then(function(id) {
                    result.selectedCalendar = id;

                    googleCalendar.getCalendars().then(function(calendars) {
                        result.calendars = calendars;
                        return res.send(result);
                    }, function(err) {
                        return res.status(400).send({ error: err.message});
                    });
                });
            }).catch(function(e) {
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