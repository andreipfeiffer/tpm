module.exports = function(knex) {

    'use strict';

    var projectsCount = '(select COUNT(*) from `projects` where idClient = `clients`.id and `isDeleted`="0") as nrProjects';

    var promise  = require('node-promise'),
        deferred = promise.defer;

    function getEmptyClient(nrProjects) {
        return {
            id         : 0,
            name       : '-',
            nrProjects : nrProjects,
            description: 'Personal projects'
        };
    }

    function getClientById(id, idUser) {
        return knex('clients')
            .select('id', 'name', 'description', knex.raw(projectsCount))
            .where({
                'id'       : id,
                'idUser'   : idUser,
                'isDeleted': '0'
            });
    }

    function getAllClients(idUser) {
        return knex('clients')
            .select('id', 'name', 'description', knex.raw(projectsCount))
            .where({
                'idUser'   : idUser,
                'isDeleted': '0'
            });
    }

    function getProjectsWithoutClient(idUser) {
        return knex('projects')
            .select('id')
            .where({
                'idUser'   : idUser,
                'isDeleted': '0',
                'idClient' : '0'
            });
    }

    return {
        getAll: function(userLogged) {
            var d = deferred(),
                noClient;

            getProjectsWithoutClient( userLogged.id ).then(function(projectsNoClient) {
                noClient = projectsNoClient;
                return getAllClients( userLogged.id );
            }).then(function(data) {
                // add the empty client data at the beginning
                data.unshift( getEmptyClient( noClient.length ) );
                d.resolve({ status: 200, body: data });
            }).catch(function(e) {
                d.resolve({ status: 503, body: { error: 'Database error: ' + e.code} });
            });

            return d.promise;
        },

        getById: function(userLogged, id) {
            var d = deferred();

            getClientById(id, userLogged.id).then(function(data) {
                if ( !data.length ) {
                    d.resolve({ status: 404, body: { error: 'Record not found'} });
                } else {
                    d.resolve({ status: 200, body: data[0] });
                }
            }).catch(function(e) {
                d.resolve({ status: 503, body: { error: 'Database error: ' + e.code} });
            });

            return d.promise;
        },

        update: function(userLogged, id, data) {
            var d = deferred();

            var editClient = knex('clients')
                .where({
                    'id'       : id,
                    'idUser'   : userLogged.id,
                    'isDeleted': '0'
                })
                .update({
                    name       : data.name,
                    description: data.description
                });

            editClient.then(function() {
                d.resolve({ status: 200, body: true });
            }).catch(function(e) {
                d.resolve({ status: 503, body: { error: 'Database error: ' + e.code} });
            });

            return d.promise;
        },

        add: function(userLogged, data) {
            var d = deferred();

            var addNewClient = knex('clients')
                .insert({
                    idUser: userLogged.id,
                    name  : data.name
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

        remove: function(userLogged, id) {
            var d = deferred();

            var softDeleteClient = knex('clients')
                .where({
                    'id'       : id,
                    'idUser'   : userLogged.id,
                    'isDeleted': '0'
                })
                .update({
                    'isDeleted': '1'
                });

            softDeleteClient.then(function() {
                d.resolve({ status: 204 });
            }).catch(function(e) {
                d.resolve({ status: 503, body: { error: 'Database error: ' + e.code} });
            });

            return d.promise;
        }
    };

};