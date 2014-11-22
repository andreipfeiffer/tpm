module.exports = function(knex) {

    'use strict';

    var authGoogle  = require('./authGoogle')( knex ),
        calendar = authGoogle.google.calendar('v3'),
        deferred = require('node-promise').defer;

    function getSelectedCalendarId(userId) {
        var d = deferred();
        knex('users').select('googleSelectedCalendar as googleCalendar').where({ id: userId }).then(function(data) {
            d.resolve(data[0].googleCalendar);
        }).catch(function(err) {
            d.reject(err);
        });
        return d.promise;
    }

    function getCalendars() {
        var d = deferred();
        calendar.calendarList.list({}, function(err, response) {
            if (err) {
                d.reject(err);
            } else {
                d.resolve(response);
            }
        });
        return d.promise;
    }

    function getProjectData(userId, projectData, eventId) {
        var d = deferred(),
            params = {};

        getSelectedCalendarId(userId).then(function(calendarId) {
            if (!calendarId.length) {
                return d.resolve(false);
            }

            params = {
                calendarId: calendarId,
                resource: {
                    summary: projectData.name,
                    start: {
                        date: projectData.dateEstimated
                    },
                    end: {
                        date: projectData.dateEstimated
                    }
                }
            };

            if (typeof eventId !== 'undefined') {
                params.eventId = eventId;
            }

            d.resolve(params);
        });

        return d.promise;
    }

    function addEvent(userId, projectData) {
        var d = deferred();

        getProjectData(userId, projectData).then(function(params) {
            if (!params) {
                return d.resolve(false);
            }

            calendar.events.insert(params, function(err, response) {
                if (err) {
                    return d.reject(err);
                }
                d.resolve(response.id);
            });
        });

        return d.promise;
    }

    function updateEvent(userId, eventId, projectData) {
        var d = deferred();

        if (!eventId.length) {
            return d.resolve(false);
        }

        getProjectData(userId, projectData, eventId).then(function(params) {
            if (!params) {
                return d.resolve(false);
            }

            calendar.events.patch(params, function(err, response) {
                if (err) {
                    return d.reject(err);
                }

                d.resolve(response.id);
            });
        });

        return d.promise;
    }

    function deleteEvent(userId, eventId) {
        var d = deferred();

        if (!eventId.trim().length) {
            return d.resolve(false);
        }

        getSelectedCalendarId(userId).then(function(calendarId) {
            if (!calendarId.length) {
                return d.resolve(false);
            }

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
        });

        return d.promise;
    }

    return {
        getSelectedCalendarId: getSelectedCalendarId,
        getCalendars: getCalendars,
        addEvent: addEvent,
        updateEvent: updateEvent,
        deleteEvent: deleteEvent
    };
};