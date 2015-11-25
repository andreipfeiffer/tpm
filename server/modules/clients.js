module.exports = (() => {

    'use strict';

    var projectsCount = '(select COUNT(*) from `projects` where idClient = `clients`.id and `isDeleted`="0") as nrProjects';

    var server = require('../../server'),
        knex   = server.knex;

    function getEmptyClient(nrProjects) {
        return {
            id         : 0,
            name       : '',
            nrProjects : nrProjects,
            description: 'Projects unassigned to a client'
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

    function getClientByName(name, idUser) {
        return knex('clients')
            .select('id', 'name', 'description', knex.raw(projectsCount))
            .where({
                'name'     : name,
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

    function addNewClient(idUser, name) {
        return knex('clients')
            .insert({
                idUser: idUser,
                name  : name
            });
    }

    function deleteClient(idClient, idUser) {
        return knex('clients')
            .where({
                'id'       : idClient,
                'idUser'   : idUser,
                'isDeleted': '0'
            })
            .update({
                'isDeleted': '1'
            });
    }

    function unAssignClient(idClient) {
        return knex('projects')
            .where({
                'idClient': idClient
            })
            .update({
                'idClient': '0'
            });
    }

    return {
        getAll(userLogged) {
            var d = Promise.defer(),
                noClient;

            getProjectsWithoutClient( userLogged.id )
                .then(projectsNoClient => {
                    noClient = projectsNoClient;
                    return getAllClients( userLogged.id );
                })
                .then(data => {
                    // add the empty client data at the beginning
                    data.unshift( getEmptyClient( noClient.length ) );
                    d.resolve({ status: 200, body: data });
                })
                .catch(e => {
                    d.resolve({ status: 503, body: { error: 'Database error: ' + e.code} });
                });

            return d.promise;
        },

        getById(userLogged, id) {
            var d = Promise.defer();

            getClientById(id, userLogged.id)
                .then(data => {
                    if ( !data.length ) {
                        d.resolve({ status: 404, body: { error: 'Record not found'} });
                    } else {
                        d.resolve({ status: 200, body: data[0] });
                    }
                })
                .catch((e) => {
                    d.resolve({ status: 503, body: { error: 'Database error: ' + e.code} });
                });

            return d.promise;
        },

        update(userLogged, id, data) {
            var d = Promise.defer();

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

            editClient
                .then(() => d.resolve({ status: 200, body: true }))
                .catch((e) => {
                    d.resolve({ status: 503, body: { error: 'Database error: ' + e.code} });
                });

            return d.promise;
        },

        add(userLogged, data) {
            var d = Promise.defer();

            addNewClient(userLogged.id, data.name)
                .then(client => getClientById(client[0], userLogged.id))
                .then(client => d.resolve( { status: 201, body: client[0] } ))
                .catch(e => {
                    d.resolve( { status: 503, body: { error: 'Database error: ' + e.code} } );
                });

            return d.promise;
        },

        remove(userLogged, id) {
            var d = Promise.defer();

            deleteClient(id, userLogged.id)
                .then(() => unAssignClient( id ))
                .then(() => d.resolve({ status: 204 }))
                .catch(e => {
                    d.resolve({ status: 503, body: { error: 'Database error: ' + e.code} });
                });

            return d.promise;
        },

        getByName: getClientByName,
        addNew   : addNewClient
    };

})();
