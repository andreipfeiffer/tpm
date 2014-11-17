module.exports = function(connection, knex) {

    'use strict';

    var table = 'clients',
        qProjects = '(select COUNT(*) from `projects` where idClient = `' + table + '`.id and `isDeleted`="0") as nrProjects';

    var getById = function(id, idUser, callback) {
        var qClients;

        qClients = 'select `' + table + '`.*, ' + qProjects + ' from `' + table + '` where `id`="' + id + '" AND `idUser`="' + idUser + '" and `isDeleted`="0"';

        connection.query(qClients, function(err, docs) {
            callback(err, docs);
        });
    };

    return {
        getAll: function(req, res) {
            var userLogged = req.user;

            var getClients = knex('clients')
                .select('*', knex.raw(qProjects))
                .where({
                    'idUser': userLogged.id,
                    'isDeleted': '0'
                });

            getClients.then(function(data) {
                return res.send(data);
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
        },

        getById: function(req, res) {
            var id = req.params.id,
                userLogged = req.user;

            getById(id, userLogged.id, function(err, docs) {
                if (err) { return res.status(503).send({ error: 'Database error'}); }
                if (!docs.length) { return res.status(410).send({ error: 'Record not found'}); }

                res.send(docs[0]);
            });
        },

        update: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            connection.query('update `' + table + '` set `name`="' + req.body.name + '", `description`="' + req.body.description + '" where `id`="' + id + '" AND `idUser`="' + userLogged.id + '" and `isDeleted`="0"', function(err) {
                if (err) { return res.status(503).send({ error: 'Database error'}); }

                res.send(true);
            });
        },

        add: function(req, res) {
            var data = req.body,
                userLogged = req.user;

            connection.query('insert into `' + table + '` (`idUser`, `name`) values ("' + userLogged.id + '", "' + data.name + '")', function(err, newItem) {
                if (err) { return res.status(503).send({ error: 'Database error'}); }

                getById(newItem.insertId, userLogged.id, function(err, docs) {
                    if (err) { return res.status(503).send({ error: 'Database error'}); }
                    if (!docs.length) { return res.status(410).send({ error: 'Record not found'}); }

                    res.status(201).send(docs[0]);
                });
            });

        },

        remove: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            connection.query('select `id` from `' + table + '` where `idUser`="' + userLogged.id + '" AND `id`="' + id + '" and `isDeleted`="0"', function(err, docs) {
                if (err) { return res.status(503).send({ error: 'Database error'}); }

                if ( docs.length === 0 ) {
                    return res.status(404).send({ error: 'id "' + id + '" was not found'});
                } else {

                    connection.query('update `' + table + '` set `isDeleted`="1" where `id`="' + id + '" and `idUser`="' + userLogged.id + '" and `isDeleted`="0"', function(err) {
                        if (err) { return res.status(503).send({ error: 'Database error'}); }

                        res.status(204).end();
                    });
                }
            });
        }
    };

};