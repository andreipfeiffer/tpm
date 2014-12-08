module.exports = function(knex) {

    'use strict';

    var calendarGoogle = require('./calendarGoogle')( knex ),
        promise = require('node-promise');

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

    return {
        getAll: function(req, res) {
            var userLogged = req.user;

            getAllProjects(userLogged.id).then(function(data) {
                return res.send(data);
            }).catch(function(e) {
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
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        update: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user,
                previousStatus;

            var editProject = knex('projects')
                .where({
                    'id': id,
                    'idUser': userLogged.id,
                    'isDeleted': '0'
                })
                .update({
                    name: req.body.name,
                    idClient: req.body.idClient,
                    status: req.body.status,
                    days: req.body.days,
                    priceEstimated: req.body.priceEstimated,
                    priceFinal: req.body.priceFinal,
                    dateAdded: req.body.dateAdded,
                    dateEstimated: req.body.dateEstimated,
                    description: req.body.description
                });

            getProjectById(id, userLogged.id).then(function(data) {
                previousStatus = data[0].status;
                if ( data[0].googleEventId.length ) {
                    return calendarGoogle.updateEvent(userLogged.id, data[0].googleEventId, req.body);
                } else {
                    return calendarGoogle.getSelectedCalendarId(userLogged.id).then(function(calendarId) {
                        return calendarGoogle.addEvent(userLogged.id, req.body, calendarId);
                    }).then(function(newEventId) {
                        return calendarGoogle.setEventId(userLogged.id, id, newEventId);
                    });
                }
            }).then(function() {
                editProject.then(function() {
                    if (previousStatus !== req.body.status) {
                        logStatusChange(userLogged.id, id, req.body.status).then(function() {
                            return res.send(true);
                        });
                    } else {
                        return res.send(true);
                    }
                })
                .catch(function(e) {
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

            knex('projects').insert(newProjectData).then(function(newProjectId) {
                return getProjectById(newProjectId, userLogged.id);
            }).then(function(project) {
                newProject = project[0];
                return calendarGoogle.addEvent(userLogged.id, newProjectData);
            }).then(function(eventId) {
                return calendarGoogle.setEventId(userLogged.id, newProject.id, eventId);
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

            getProjectById(id, userLogged.id).then(function(data) {
                return calendarGoogle.deleteEvent(userLogged.id, data[0].googleEventId);
            }).then(function() {
                return softDeleteProject;
            }).then(function() {
                return res.status(204).end();
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        removeEvents: function(userId) {
            var d = promise.defer(),
                calendarId;

            calendarGoogle.getSelectedCalendarId(userId).then(function(id) {
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
                return calendarGoogle.removeEvents(projects, calendarId);
            }).then(function() {
                return calendarGoogle.clearEvents(userId);
            }).then(function(result) {
                d.resolve(result);
            })/*.catch(function(err) {
                d.reject(err);
            })*/;

            return d.promise;
        }
    };

};