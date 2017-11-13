module.exports = (() => {

    'use strict';

    var server   = require('../../server'),
        knex     = server.knex,
        google   = require('googleapis'),
        calendar = google.calendar('v3');

    function getSelectedCalendarId(userId) {
        return new Promise((resolve, reject) => {
            knex('users')
                .select('googleSelectedCalendar as googleCalendar')
                .where({ id: userId })
                .then(data => resolve(data[0].googleCalendar))
                .catch(err => reject(err));
        });
    }

    function getCalendars() {
        return new Promise((resolve, reject) => {
            calendar.calendarList.list({ minAccessRole: 'owner' }, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    }

    function getProjectData(userId, projectData, calendarId) {
        return new Promise((resolve) => {
            if ( typeof calendarId === 'undefined' || !calendarId ) {
                getSelectedCalendarId(userId)
                    .then(id => {
                        if ( !id.length ) {
                            return resolve(false);
                        }
                        resolve( getProjectDataRaw(projectData, id) );
                    });
            } else {
                resolve( getProjectDataRaw(projectData, calendarId) );
            }
        });
    }

    function getProjectDataRaw(projectData, calendarId) {
        var params  = {},
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
        return new Promise((resolve) => {
            getProjectData(userId, projectData, calendarId).then(params => {
                if (!params) {
                    return resolve(false);
                }

                calendar.events.insert(params, (err, response) => {
                    // id error from API, don't reject, resolve with 0
                    var id = err ? 0 : response.id;
                    resolve( id );
                });
            });
        });
    }

    function updateEvent(userId, eventId, projectData) {
        return new Promise((resolve) => {
            let data = JSON.parse( JSON.stringify(projectData) );

            if ( !eventId.length ) {
                return resolve(false);
            }

            data.googleEventId = eventId;

            getProjectData(userId, data).then(params => {
                if (!params) {
                    return resolve(false);
                }

                // @todo apparently if you patch an event, that was deleted manually
                // from the calendar, the request returns ok
                // although should return 404
                // so, we cannot know if the event was updated, or ignored

                calendar.events.patch(params, (err, response) => {
                    if (err) {
                        var newEventId;

                        addEvent(userId, projectData)
                            .then(newId => {
                                newEventId = newId;
                                return setEventId(userId, projectData.id, newEventId);
                            })
                            .then(() => resolve(newEventId));
                    } else {
                        resolve(response.id);
                    }
                });
            });
        });
    }

    function deleteEvent(userId, eventId) {
        return new Promise((resolve) => {

            if (!eventId.trim().length) {
                return resolve(false);
            }

            getSelectedCalendarId(userId).then(calendarId => {
                if (!calendarId.length) {
                    return resolve(false);
                }

                var params = {
                    calendarId: calendarId,
                    eventId   : eventId
                };

                calendar.events.delete(params, (err, response) => {
                    if (err) {
                        // don't reject this, but fail it silently, and log it
                        var log = {
                            idUser: userId,
                            source: 'googleCalendar.deleteEvent',
                            error : err
                        };
                        server.app.emit('logError', log);
                        return resolve(false);
                    } else {
                        resolve(response);
                    }
                });
            });
        });
    }

    function getProjectsWithEvent(userId) {
        return knex('projects')
            .select()
            .where({
                'idUser'   : userId,
                'isDeleted': '0'
            })
            .andWhere('googleEventId', '!=', '')
            .andWhere('dateEstimated', '>=', getTodayDate())
            // @todo WTF of error handling is this?
            .catch(e => console.log(e));
    }

    function getProjectsWithoutEvent(userId) {
        return knex('projects')
            .select()
            .where({
                'idUser'       : userId,
                'isDeleted'    : '0',
                'googleEventId': ''
            })
            .andWhere('dateEstimated', '>=', getTodayDate())
            // @todo WTF of error handling is this?
            .catch(e => console.log(e));
    }

    function changeCalendar(userId, oldCalendar, newCalendar) {
        return new Promise((resolve) => {

            if (oldCalendar === newCalendar || !newCalendar.length) {
                return resolve(false);
            }

            getProjectsWithEvent(userId)
                .then(data => moveEventsToAnotherCalendar(data, oldCalendar, newCalendar))
                .then(() => getProjectsWithoutEvent(userId))
                .then(data => addEventsToCalendar(userId, data, newCalendar))
                .then(() => resolve(true));
        });
    }

    function addEventsToCalendar(userId, eventsArray, newCalendar) {
        return new Promise((resolve) => {
            const requests = [];

            eventsArray.forEach(project => {
                requests.push(
                    addEvent(userId, project, newCalendar)
                        .then(eventId => setEventId(userId, project.id, eventId))
                );
            });

            Promise
                .all( requests )
                .then(result => resolve(result));
        });
    }

    function moveEventsToAnotherCalendar(eventsArray, oldCalendar, newCalendar) {
        return new Promise((resolve) => {
            const requests = [];

            eventsArray.forEach(project => {
                requests.push(
                    moveEvent(project.googleEventId, oldCalendar, newCalendar)
                );
            });

            Promise
                .all( requests )
                .then(() => resolve(true));
        });
    }

    function moveEvent(id, oldCalendar, newCalendar) {
        return new Promise((resolve) => {
            const params = {
                calendarId : oldCalendar,
                destination: newCalendar,
                eventId    : id
            };

            calendar.events.move(params, (err, response) => {
                if (err) {
                    resolve( false );
                } else {
                    resolve( response );
                }
            });
        });
    }

    function setEventId(idUser, idProject, idEvent) {
        return new Promise((resolve) => {
            if ( idEvent || idEvent === '' ) {
                knex('projects')
                    .where({
                        'id'       : idProject,
                        'idUser'   : idUser,
                        'isDeleted': '0'
                    })
                    .update({
                        googleEventId: idEvent
                    })
                    .then(result => resolve(result));
            } else {
                resolve(false);
            }
        });
    }

    function clearEvents(userId) {
        return knex('projects')
            .where({
                'idUser'   : userId,
                'isDeleted': '0'
            })
            .andWhere('googleEventId', '!=', '')
            .update({'googleEventId': ''})
            // @todo WTF of error handling is this?
            .catch(e => console.log(e));
    }

    function removeEvents(projects, calendarId) {
        var requests = [];

        if (projects && projects.length) {
            projects.forEach(project => {
                requests.push(
                    removeEvent(project.googleEventId, calendarId)
                );
            });
        }

        return Promise.all( requests );
    }

    function removeEvent(eventId, calendarId) {
        return new Promise((resolve) => {
            
            const params = {
                calendarId: calendarId,
                eventId   : eventId
            };

            calendar.events.delete(params, (err, response) => {
                if (err) {
                    resolve( false );
                } else {
                    resolve( response );
                }
            });
        });
    }

    function getTodayDate() {
        return getDateFormat();
    }

    function getDateFormat(date) {
        var today = date ? new Date(date) : new Date(),
            dd    = today.getDate(),
            mm    = today.getMonth() + 1,
            yyyy  = today.getFullYear();

        if (dd < 10) { dd = '0' + dd; }
        if (mm < 10) { mm = '0' + mm; }

        return yyyy + '-'+ mm + '-'+ dd;
    }

    function doesEventExists(eventId) {
        return !!eventId.length;
    }

    return {
        getSelectedCalendarId,
        getCalendars,
        addEvent,
        updateEvent,
        deleteEvent,
        setEventId,
        removeEvents,
        clearEvents,
        changeCalendar,
        doesEventExists
    };
})();
