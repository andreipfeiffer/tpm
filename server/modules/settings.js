module.exports = function(knex) {

    'use strict';

    var authGoogle = require('./authGoogle')( knex ),
        googleCalendar = require('./calendarGoogle')( knex );

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

                    googleCalendar.getCalendars().then(function(calendars) {
                        result.calendars = calendars;
                        return res.send(result);
                    }, function() {
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