module.exports = function(knex) {

    'use strict';

    var googleCalendar    = require('./googleCalendar')( knex ),
        googleClient      = require('./googleClient')( knex ),
        promise           = require('node-promise'),
        server            = require('../../server'),
        status            = require('./status'),
        clients           = require('./clients')( knex ),
        statusArr         = ['on hold', 'in progress', 'finished', 'paid', 'cancelled'],
        statusArrActive   = [statusArr[0], statusArr[1]],
        statusArrInactive = [statusArr[2], statusArr[3], statusArr[4]];

    function getProjectById(id, idUser) {
        return knex('projects')
            .select('projects.*', 'clients.name AS clientName')
            .leftJoin('clients', 'projects.idClient', 'clients.id')
            .where({
                'projects.id'       : id,
                'projects.idUser'   : idUser,
                'projects.isDeleted': '0'
            });
    }

    function getAllProjects(idUser) {

        var q = '';

        q += 'SELECT';
        q += ' projects.*, status_log.date';

        q += ' FROM projects';

        q += ' LEFT JOIN (SELECT date, idProject, status FROM projects_status_log ORDER BY date DESC)';
        q += ' AS status_log';
        q += ' ON projects.id = status_log.idProject';
        q += ' AND projects.status = status_log.status';

        q += ' WHERE projects.idUser = ' + idUser;
        q += ' AND projects.isDeleted = 0';
        q += ' GROUP BY status_log.idProject';

        return knex.raw( q );
    }

    function logStatusChange(idUser, idProject, status) {
        return knex('projects_status_log')
            .insert({
                idUser   : idUser,
                idProject: idProject,
                status   : status
            });
    }

    function getActiveProjects(userId) {
        return knex('projects')
            .select()
            .where({
                'idUser'   : userId,
                'isDeleted': '0'
            })
            .andWhere('googleEventId', '!=', '')
            .catch(function(e) {
                console.log(e);
            });
    }

    function isStatusActive(status) {
        return (statusArrActive.indexOf(status) > -1);
    }

    function isStatusInactive(status) {
        return (statusArrInactive.indexOf(status) > -1);
    }

    function hasStatusChangedToInactive(newStatus, oldStatus) {
        if ( newStatus === oldStatus ) {
            return false;
        }
        if ( !isStatusActive( oldStatus ) || !isStatusInactive( newStatus ) ) {
            return false;
        }
        return true;
    }

    function getProjectData(idUser, data) {
        var d = promise.defer();

        var projectData = {
            idClient      : 0,
            name          : data.name,
            status        : data.status,
            days          : parseInt(data.days) || 0,
            priceEstimated: parseInt(data.priceEstimated) || 0,
            priceFinal    : parseInt(data.priceFinal) || 0,
            // dateAdded     : data.dateAdded,
            dateEstimated : data.dateEstimated,
            description   : data.description
        };

        // add fields for New Project
        if ( !parseInt( data.id ) ) {
            projectData.idUser    = idUser;
            projectData.dateAdded = data.dateAdded;
        }

        getClientId(idUser, data).then(function(idClient) {
            projectData.idClient = idClient;
            d.resolve( projectData );
        });

        return d.promise;
    }

    function getClientId(idUser, data) {
        var d = promise.defer();

        clients.getByName(data.clientName, idUser).then(function(client) {

            if ( client.length ) {
                // client is found, so we set its id
                d.resolve( client[0].id );
            } else {

                if ( data.clientName && data.clientName.trim().length ) {
                    // client is not found, but the clientName was filled
                    // we add the new client, and set the new client id
                    clients.addNew(idUser, data.clientName).then(function(client) {
                        d.resolve( client[0] );
                    });
                } else {
                    // client is not found, and clientName was not filled
                    // we set "no client"
                    d.resolve( 0 );
                }

            }
        });

        return d.promise;
    }

    return {
        getAll: function(req, res) {
            var userLogged = req.user;

            getAllProjects(userLogged.id).then(function(data) {
                return res.send( data[0] );
            }).catch(function(e) {
                var log = {
                    idUser: userLogged.id,
                    source: 'projects.getAll',
                    error : e
                };
                server.app.emit('logError', log);
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        getById: function(req, res) {
            var id = req.params.id,
                userLogged = req.user;

            getProjectById(id, userLogged.id).then(function(data) {
                if (!data.length) { return res.status(404).send({ error: 'Record not found'}); }
                return res.send(data[0]);
            }).catch(function(e) {
                var log = {
                    idUser: userLogged.id,
                    source: 'projects.getById',
                    error : e
                };
                server.app.emit('logError', log);
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        update: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged      = req.user,
                isStatusChanged = false,
                newStatus       = req.body.status,
                oldStatus, eventId, editData;

            function editProject(id, idUser, data) {
                return knex('projects')
                    .where({
                        'id'       : id,
                        'idUser'   : idUser,
                        'isDeleted': '0'
                    }).update( data );
            }

            googleClient.updateTokens(req.user);

            getProjectData(userLogged.id, req.body).then(function(data) {
                editData = data;
                return getProjectById(id, userLogged.id);
            }).then(function(data) {
                eventId         = data[0].googleEventId;
                oldStatus       = data[0].status;
                isStatusChanged = (oldStatus !== newStatus);

                if ( eventId.length ) {
                    if ( hasStatusChangedToInactive( newStatus, oldStatus ) ) {
                        // update the editData, so the eventId will be removed
                        editData.googleEventId = '';
                        return googleCalendar.deleteEvent(userLogged.id, eventId);
                    } else {
                        return googleCalendar.updateEvent(userLogged.id, eventId, req.body);
                    }
                } else if ( isStatusActive(newStatus) ) {
                    return googleCalendar.getSelectedCalendarId(userLogged.id).then(function(calendarId) {
                        return googleCalendar.addEvent(userLogged.id, req.body, calendarId);
                    }).then(function(newEventId) {
                        return googleCalendar.setEventId(userLogged.id, id, newEventId);
                    });
                }
            }).then(function() {
                editProject( id, userLogged.id, editData ).then(function() {
                    if ( isStatusChanged ) {
                        // emit websocket event
                        status.updateIncome();

                        logStatusChange(userLogged.id, id, newStatus).then(function() {
                            return res.send(true);
                        });
                    } else {
                        return res.send(true);
                    }
                })
                .catch(function(e) {
                    var log = {
                        idUser: userLogged.id,
                        source: 'projects.update',
                        data: req.body,
                        error: e
                    };
                    server.app.emit('logError', log);
                    return res.status(503).send({ error: 'Database error: ' + e.code});
                });
            });
        },

        add: function(req, res) {
            var data = req.body,
                userLogged = req.user,
                newProject = {},
                newProjectData;

            googleClient.updateTokens(req.user);

            getProjectData(userLogged.id, data).then(function(data) {
                newProjectData = data;
                return knex('projects').insert( newProjectData );
            }).then(function(newProjectId) {
                // emit websocket event
                status.updateProjects();
                return getProjectById(newProjectId, userLogged.id);
            }).then(function(project) {
                newProject = project[0];
                if ( isStatusActive( data.status ) ) {
                    return googleCalendar.addEvent(userLogged.id, newProjectData);
                }
            }).then(function(eventId) {
                return googleCalendar.setEventId(userLogged.id, newProject.id, eventId);
            }).then(function() {
                return logStatusChange(userLogged.id, newProject.id, req.body.status);
            }).then(function() {
                return res.status(201).send(newProject);
            }, function(err) {
                var log = {
                    idUser: userLogged.id,
                    source: 'projects.add',
                    data  : req.body,
                    error : err
                };
                server.app.emit('logError', log);
                return res.status(503).send({ error: 'Error: ' + err.code});
            });
        },

        remove: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            var softDeleteProject = knex('projects')
                .where({
                    'id'       : id,
                    'idUser'   : userLogged.id,
                    'isDeleted': '0'
                })
                .update({
                    'isDeleted'    : '1',
                    'googleEventId': ''
                });

            googleClient.updateTokens(req.user);

            getProjectById(id, userLogged.id).then(function(data) {
                return googleCalendar.deleteEvent(userLogged.id, data[0].googleEventId);
            }).then(function() {
                return softDeleteProject;
            }).then(function() {
                  // emit websocket event
                status.updateProjects();
                return res.status(204).end();
            }).catch(function(e) {
                var log = {
                    idUser: userLogged.id,
                    source: 'projects.remove',
                    error : e
                };
                server.app.emit('logError', log);
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        removeEvents: function(userId) {
            var d = promise.defer(),
                calendarId;

            googleCalendar.getSelectedCalendarId(userId).then(function(id) {
                var d = promise.defer();
                calendarId = id;

                if (!calendarId.length) {
                    d.resolve(false);
                } else {
                    getActiveProjects(userId).then(function(projects) {
                        d.resolve(projects);
                    });
                }
                return d.promise;
            }).then(function(projects) {
                return googleCalendar.removeEvents(projects, calendarId);
            }).then(function() {
                return googleCalendar.clearEvents(userId);
            }).then(function(result) {
                d.resolve(result);
            })/*.catch(function(err) {
                d.reject(err);
            })*/;

            return d.promise;
        }
    };

};
