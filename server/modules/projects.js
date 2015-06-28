module.exports = function(knex) {

    'use strict';

    var googleCalendar    = require('./googleCalendar')( knex ),
        googleClient      = require('./googleClient')( knex ),
        promise           = require('node-promise'),
        server            = require('../../server'),
        statusArr         = ['on hold', 'in progress', 'finished', 'paid'],
        statusArrActive   = [statusArr[0], statusArr[1]],
        statusArrInactive = [statusArr[2], statusArr[3]];

    function getProjectById(id, idUser) {
        return knex('projects')
            .select()
            .where({
                'id': id,
                'idUser': idUser,
                'isDeleted': '0'
            });
    }

    function getAllProjects(idUser) {
        return knex('projects')
            .select()
            .where({
                'idUser': idUser,
                'isDeleted': '0'
            });
    }

    function logStatusChange(idUser, idProject, status) {
        return knex('projects_status_log')
            .insert({
                idUser: idUser,
                idProject: idProject,
                status: status
            });
    }

    function addNewClient(idUser, idProject, name) {
        return knex('clients')
            .insert({
                idUser: idUser,
                name: name
            })
            .then(function(clients) {
                return knex('projects')
                    .where({'id': idProject, 'idUser': idUser})
                    .update({idClient: clients[0]});
            });
    }

    function getActiveProjects(userId) {
        return knex('projects')
            .select()
            .where({
                'idUser': userId,
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

    return {
        getAll: function(req, res) {
            var userLogged = req.user;

            getAllProjects(userLogged.id).then(function(data) {
                return res.send(data);
            }).catch(function(e) {
                var log = {
                    idUser: userLogged.id,
                    source: 'projects.getAll',
                    error: e
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
                    error: e
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
                oldStatus, eventId;

            var editData = {
                name          : req.body.name,
                idClient      : req.body.idClient,
                status        : req.body.status,
                days          : req.body.days,
                priceEstimated: req.body.priceEstimated,
                priceFinal    : req.body.priceFinal,
                dateAdded     : req.body.dateAdded,
                dateEstimated : req.body.dateEstimated,
                description   : req.body.description
            };


            var editProject = knex('projects')
                .where({
                    'id': id,
                    'idUser': userLogged.id,
                    'isDeleted': '0'
                }).update( editData );

            googleClient.updateTokens(req.user);

            getProjectById(id, userLogged.id).then(function(data) {
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
                } else {
                    return googleCalendar.getSelectedCalendarId(userLogged.id).then(function(calendarId) {
                        return googleCalendar.addEvent(userLogged.id, req.body, calendarId);
                    }).then(function(newEventId) {
                        return googleCalendar.setEventId(userLogged.id, id, newEventId);
                    });
                }
            }).then(function() {
                editProject.then(function() {
                    if ( isStatusChanged ) {
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
                newProjectData = {
                    idUser: userLogged.id,
                    idClient: data.idClient,
                    name: data.name,
                    status: data.status,
                    days: parseInt(data.days) || 0,
                    priceEstimated: parseInt(data.priceEstimated) || 0,
                    priceFinal: parseInt(data.priceFinal) || 0,
                    dateAdded: data.dateAdded,
                    dateEstimated: data.dateEstimated,
                    description: data.description
                };

            googleClient.updateTokens(req.user);

            knex('projects').insert(newProjectData).then(function(newProjectId) {
                return getProjectById(newProjectId, userLogged.id);
            }).then(function(project) {
                newProject = project[0];
                return googleCalendar.addEvent(userLogged.id, newProjectData);
            }).then(function(eventId) {
                return googleCalendar.setEventId(userLogged.id, newProject.id, eventId);
            }).then(function() {
                return logStatusChange(userLogged.id, newProject.id, req.body.status);
            }).then(function() {
                if ( data.newClientName.length ) {
                    return addNewClient(userLogged.id, newProject.id, data.newClientName ).then(function() {
                        return getProjectById(newProject.id, userLogged.id);
                    }).then(function(data) {
                        return res.status(201).send(data[0]);
                    });
                } else {
                    return res.status(201).send(newProject);
                }
            }, function(err) {
                var log = {
                    idUser: userLogged.id,
                    source: 'projects.add',
                    data: req.body,
                    error: err
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
                    'id': id,
                    'idUser': userLogged.id,
                    'isDeleted': '0'
                })
                .update({
                    'isDeleted': '1',
                    'googleEventId': ''
                });

            googleClient.updateTokens(req.user);

            getProjectById(id, userLogged.id).then(function(data) {
                return googleCalendar.deleteEvent(userLogged.id, data[0].googleEventId);
            }).then(function() {
                return softDeleteProject;
            }).then(function() {
                return res.status(204).end();
            }).catch(function(e) {
                var log = {
                    idUser: userLogged.id,
                    source: 'projects.remove',
                    error: e
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