module.exports = function(connection) {

    'use strict';

    var table = 'projects';

    var getById = function(id, idUser, callback) {
        connection.query('select * from `' + table + '` where `id`="' + id + '" AND `idUser`="' + idUser + '"', function(err, docs) {
            callback(err, docs);
        });
    };

    return {
        getAll: function(req, res) {
            var userLogged = req.user;
            connection.query('select `'+table+'`.*, `clients`.name AS `clientName` from `'+table+'` RIGHT JOIN `clients` ON `' + table + '`.idClient = `clients`.id WHERE `'+table+'`.idUser="' + userLogged.id + '"', function(err, docs) {
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
            var q = 'update `' + table + '` set `name`= "' + req.body.name + '" where `id`="' + id + '" AND `idUser`="' + userLogged.id + '"';
            console.log(q);
            connection.query(q, function(err) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                res.send(true);
            });
        },

        add: function(req, res) {
            var data = req.body.project,
                userLogged = req.user;

            // @todo use knex (http://knexjs.org/#Builder-insert)
            connection.query('insert into `' + table + '` (`idUser`, `idClient`, `name`, `isCompleted`) values ("' + userLogged.id + '", "' + data.idClient + '", "' + data.name + '", "' + data.isCompleted + '")', function(err, newItem) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                getById(newItem.insertId, userLogged.id, function(err, docs) {
                    if (err) { return res.send(503, { error: 'Database error'}); }
                    if (!docs) { return res.send(410, { error: 'Record not found'}); }

                    // need to return an object that contains all the data including the database id
                    // so Ember can update its store, with the new ID from database
                    res.send({'project': docs[0]});
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
                    connection.query('delete from `' + table + '` where `idUser`="' + userLogged.id + '" AND `id`="' + id + '"', function(err) {
                        if (err) { return res.send(503, { error: 'Database error'}); }

                        res.send(true);
                    });
                }
            });
        }
    };

};