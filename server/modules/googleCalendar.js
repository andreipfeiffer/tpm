module.exports = function(knex) {

    'use strict';

    var google = require('googleapis'),
        calendar = google.calendar('v3'),
        promise = require('node-promise'),
        deferred = promise.defer,
        server = require('../../server');

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
        calendar.calendarList.list({ minAccessRole: 'owner' }, function(err, response) {
            if (err) {
                d.reject(err);
            } else {
                d.resolve(response);
            }
        });
        return d.promise;
    }

    function getProjectData(userId, projectData, calendarId) {
        var d = deferred();

        if ( typeof calendarId === 'undefined' || !calendarId ) {
            getSelectedCalendarId(userId).then(function(id) {
                if (!id.length) {
                    return d.resolve(false);
                }
                d.resolve( getProjectDataRaw(projectData, id) );
            });
        } else {
            d.resolve( getProjectDataRaw(projectData, calendarId) );
        }

        return d.promise;
    }

    function getProjectDataRaw(projectData, calendarId) {
        var params = {},
            eventId = projectData.googleEventId;

        params = {
            calendarId: calendarId,
            resource: {
                summary: projectData.name,
                start: {
                    date: getDateFormat( projectData.dateEstimated )
                },
                end: {
                    date: getDateFormat( projectData.dateEstimated )
                }
            }
        };

        if ( eventId && eventId.length ) {
            params.eventId = eventId;
        }

        return params;
    }

    function addEvent(userId, projectData, calendarId) {
        var d = deferred();

        getProjectData(userId, projectData, calendarId).then(function(params) {
            if (!params) {
                return d.resolve(false);
            }

            calendar.events.insert(params, function(err, response) {
                // id error from API, don't reject, resolve with 0
                var id = err ? 0 : response.id;
                d.resolve( id );
            });
        });

        return d.promise;
    }

    function updateEvent(userId, eventId, projectData) {
        var d = deferred(),
            data = JSON.parse( JSON.stringify(projectData) );

        if ( !eventId.length ) {
            return d.resolve(false);
        }

        data.googleEventId = eventId;

        getProjectData(userId, data).then(function(params) {
            if (!params) {
                return d.resolve(false);
            }

            // @todo apparently if you patch an event, that was deleted manually
            // from the calendar, the request returns ok
            // although should return 404
            // so, we cannot know if the event was updated, or ignored

            calendar.events.patch(params, function(err, response) {
                if (err) {
                    var newEventId;

                    addEvent(userId, projectData)
                        .then(function(newId) {
                            newEventId = newId;
                            return setEventIdOnProject(userId, projectData.id, newEventId);
                        })
                        .then(function() {
                            d.resolve(newEventId);
                        });
                } else {
                    d.resolve(response.id);
                }
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
                    // don't reject this, but fail it silently, and log it
                    var log = {
                        idUser: userId,
                        source: 'googleCalendar.deleteEvent',
                        error: err
                    };
                    server.app.emit('logError', log);
                    return d.resolve(false);
                } else {
                    d.resolve(response);
                }
            });
        });

        return d.promise;
    }

    function getProjectsWithEvent(userId) {
        return knex('projects')
            .select()
            .where({
                'idUser': userId,
                'isDeleted': '0'
            })
            .andWhere('googleEventId', '!=', '')
            .andWhere('dateEstimated', '>=', getTodayDate())
            .catch(function(e) {
                console.log(e);
            });
    }

    function getProjectsWithoutEvent(userId) {
        return knex('projects')
            .select()
            .where({
                'idUser': userId,
                'isDeleted': '0',
                'googleEventId': ''
            })
            .andWhere('dateEstimated', '>=', getTodayDate())
            .catch(function(e) {
                console.log(e);
            });
    }

    function changeCalendar(userId, oldCalendar, newCalendar) {
        var d = deferred();

        if (oldCalendar === newCalendar || !newCalendar.length) {
            return d.resolve(false);
        }

        getProjectsWithEvent(userId).then(function(data) {
            return moveEventsToAnotherCalendar(data, oldCalendar, newCalendar);
        }).then(function() {
            return getProjectsWithoutEvent(userId);
        }).then(function(data) {
            return addEventsToCalendar(userId, data, newCalendar);
        }).then(function() {
            d.resolve(true);
        });

        return d.promise;
    }

    function addEventsToCalendar(userId, eventsArray, newCalendar) {
        var d = deferred(),
            requests = [];

        eventsArray.forEach(function(project) {
            requests.push(
                addEvent(userId, project, newCalendar).then(function(eventId) {
                    return setEventIdOnProject(userId, project.id, eventId);
                })
            );
        });

        promise.all( requests ).then(function(result) {
            d.resolve(result);
        });

        return d.promise;
    }

    function moveEventsToAnotherCalendar(eventsArray, oldCalendar, newCalendar) {
        var d = deferred(),
            requests = [];

        eventsArray.forEach(function(project) {
            requests.push(
                moveEvent(project.googleEventId, oldCalendar, newCalendar)
            );
        });

        promise.all( requests ).then(function() {
            d.resolve(true);
        });

        return d.promise;
    }

    function moveEvent(id, oldCalendar, newCalendar) {
        var d = deferred(),
            params = {
                calendarId: oldCalendar,
                destination: newCalendar,
                eventId: id
            };

        calendar.events.move(params, function(err, response) {
            if (err) {
                d.resolve( false );
            } else {
                d.resolve(response);
            }
        });

        return d.promise;
    }

    function setEventIdOnProject(idUser, idProject, idEvent) {
        var d = deferred();

        if ( idEvent || idEvent === '' ) {
            knex('projects')
                .where({
                    'id': idProject,
                    'idUser': idUser,
                    'isDeleted': '0'
                })
                .update({
                    googleEventId: idEvent
                })
                .then(function(result) {
                    d.resolve(result);
                });
        } else {
            d.resolve(false);
        }
        return d.promise;
    }

    function clearEvents(userId) {
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
    }

    function removeEventsList(projects, calendarId) {
        var requests = [];

        if (projects && projects.length) {
            projects.forEach(function(project) {
                requests.push(
                    removeEvent(project.googleEventId, calendarId)
                );
            });
        }

        return promise.all( requests );
    }

    function removeEvent(eventId, calendarId) {
        var d = promise.defer();

        var params = {
            calendarId: calendarId,
            eventId: eventId
        };

        calendar.events.delete(params, function(err, response) {
            if (err) {
                d.resolve(false);
            } else {
                d.resolve(response);
            }
        });

        return d.promise;
    }

    function getTodayDate() {
        return getDateFormat();
    }

    function getDateFormat(date) {
        var today = date ? new Date(date) : new Date(),
            dd = today.getDate(),
            mm = today.getMonth() + 1,
            yyyy = today.getFullYear();

        if (dd < 10) { dd = '0' + dd; }
        if (mm < 10) { mm = '0' + mm; }

        return yyyy + '-'+ mm + '-'+ dd;
    }

    return {
        getSelectedCalendarId: getSelectedCalendarId,
        getCalendars         : getCalendars,
        addEvent             : addEvent,
        updateEvent          : updateEvent,
        deleteEvent          : deleteEvent,
        setEventId           : setEventIdOnProject,
        removeEvents         : removeEventsList,
        clearEvents          : clearEvents,
        changeCalendar       : changeCalendar
    };
};