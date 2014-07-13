module.exports = function(connection) {

    'use strict';

    var table = 'clients';

    var getById = function(id, idUser, callback) {
        connection.query('select * from `' + table + '` where `id`="' + id + '" AND `idUser`="' + idUser + '"', function(err, docs) {
            callback(err, docs);
        });
    };

    return {
        getAll: function(req, res) {
            var userLogged = req.user,
                qClients,
                qProjects;

            qProjects = '(select COUNT(*) from `projects` where idClient = `' + table + '`.id)';
            qClients = 'select `' + table + '`.*, '+qProjects+' as nrProjects from `' + table + '` where `idUser`="' + userLogged.id + '"';

            connection.query(qClients, function(err, docs) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                res.send(docs);
            });
        },

        getById: function(req, res) {
            var id = req.params.id,
                userLogged = req.user;

            getById(id, userLogged.id, function(err, docs) {
                if (err) { return res.send(503, { error: 'Database error'}); }
                if (!docs) { return res.send(410, { error: 'Record not found'}); }

                res.send(docs[0]);
            });
        },

        update: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            // @todo handle all update variations
            connection.query('update `' + table + '` set `name`="' + req.body.client.name + '" where `id`="' + id + '" AND `idUser`="' + userLogged.id + '"', function(err) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                res.send(true);
            });
        },

        add: function(req, res) {
            var data = req.body.client,
                userLogged = req.user;

            connection.query('insert into `' + table + '` (`idUser`, `name`) values ("' + userLogged.id + '", "' + data.name + '")', function(err, newItem) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                getById(newItem.insertId, userLogged.id, function(err, docs) {
                    if (err) { return res.send(503, { error: 'Database error'}); }
                    if (!docs) { return res.send(410, { error: 'Record not found'}); }

                    res.send(docs[0]);
                });
            });

        },

        remove: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            connection.query('select `id` from `' + table + '` where `idUser`="' + userLogged.id + '" AND `id`="' + id + '"', function(err, docs) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                if ( docs.length === 0 ) {
                    return res.send(404, { error: 'id "' + id + '" was not found'});
                } else {

                    // @todo remove projects also

                    connection.query('delete from `' + table + '` where `idUser`="' + userLogged.id + '" AND `id`="' + id + '"', function(err) {
                        if (err) { return res.send(503, { error: 'Database error'}); }

                        res.send(true);
                    });
                }
            });
        }
    };

};