module.exports = (function() {

    'use strict';

    var server         = require('../../server'),
        knex           = server.knex,
        googleCalendar = require('./googleCalendar'),
        googleClient   = require('./googleClient'),
        extend         = require('util')._extend;

    function getUserSettings(idUser) {
        return knex('settings')
            .select('currency')
            .where({ 'idUser': idUser });
    }

    function updateUserSettings(idUser, settings) {
        return knex('settings')
            .where({ 'idUser': idUser })
            .update( settings );
    }

    function insertUserSettings(idUser, settings) {
        var data = extend({
            'idUser': idUser
        }, settings);

        return knex('settings').insert( data );
    }

    function setUserSettings(idUser, data) {
        return getUserSettings( idUser ).then(function(s) {
            if ( s.length ) {
                return updateUserSettings(idUser, data);
            } else {
                return insertUserSettings(idUser, data);
            }
        });
    }

    return {
        getGoogle: function(req, res) {
            var userLogged = req.user,
                result = {};

            googleClient.getTokens(userLogged.id).then(function(tokens) {
                result.googleToken = !!tokens[0].accessToken.length;

                if (!result.googleToken) {
                    return res.send(result);
                }

                googleClient.updateTokens(req.user);

                googleCalendar.getSelectedCalendarId(userLogged.id).then(function(id) {
                    result.selectedCalendar = id;

                    googleCalendar.getCalendars().then(function(calendars) {
                        result.calendars = calendars;
                        return res.send(result);
                    }, function(err) {
                        return res.status(400).send({ error: err.message });
                    });
                });
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        setGoogle: function(req, res) {
            var userLogged = req.user,
                newId = req.params.calendarId;

            googleClient.updateTokens(req.user);

            googleCalendar.getSelectedCalendarId(userLogged.id).then(function(id) {
                return googleCalendar.changeCalendar(userLogged.id, id, newId);
            }).then(function() {
                return knex('users')
                    .where({ id: userLogged.id })
                    .update({
                        googleSelectedCalendar: newId
                    })
                    .then(function() {
                        return res.send(true);
                    })
                    .catch(function(e) {
                        return res.status(503).send({ error: 'Database error: ' + e.code});
                    });
            });
        },

        getUser: function(req, res) {
            var userLogged = req.user;

            getUserSettings( userLogged.id ).then(function( settings ) {
                return res.send( settings[0] );
            });
        },

        setUser: function(req, res) {
            var userLogged = req.user,
                data       = req.body;

            setUserSettings( userLogged.id, data ).then(function() {
                return res.send(true);
            });
        }
    };

})();
