module.exports = function(knex) {

    'use strict';

    var projectsCount = '(select COUNT(*) from `projects` where idClient = `clients`.id and `isDeleted`="0") as nrProjects';

    var promise = require('node-promise'),
        deferred = promise.defer;

    function getClientById(id, idUser) {
        return knex('clients')
            .select('*', knex.raw(projectsCount))
            .where({
                'id': id,
                'idUser': idUser,
                'isDeleted': '0'
            });
    }

    function getAllClients(idUser) {
        return knex('clients')
            .select('*', knex.raw(projectsCount))
            .where({
                'idUser': idUser,
                'isDeleted': '0'
            });
    }

    return {
        getAll: function(req, res) {
            var userLogged = req.user;

            getAllClients(userLogged.id).then(function(data) {
                return res.send(data);
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        getById: function(req, res) {
            var id = req.params.id,
                userLogged = req.user;

            getClientById(id, userLogged.id).then(function(data) {
                if (!data.length) { return res.status(404).send({ error: 'Record not found'}); }
                return res.send(data[0]);
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        update: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            var editClient = knex('clients')
                .where({
                    'id': id,
                    'idUser': userLogged.id,
                    'isDeleted': '0'
                })
                .update({
                    name: req.body.name,
                    description: req.body.description
                });

            editClient.then(function() {
                return res.send(true);
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        add: function(userLogged, data) {
            var d = deferred();

            var addNewClient = knex('clients')
                .insert({
                    idUser: userLogged.id,
                    name: data.name
                });

            addNewClient
                .then(function(client) {
                    return getClientById(client[0], userLogged.id);
                })
                .then(function(client) {
                    d.resolve( { status: 201, body: client[0] } );
                })
                .catch(function(e) {
                    d.resolve( { status: 503, body: { error: 'Database error: ' + e.code} } );
                });

            return d.promise;
        },

        remove: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            var softDeleteClient = knex('clients')
                .where({
                    'id': id,
                    'idUser': userLogged.id,
                    'isDeleted': '0'
                })
                .update({
                    'isDeleted': '1'
                });

            softDeleteClient.then(function() {
                return res.status(204).end();
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        }
    };

};