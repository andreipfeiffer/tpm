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
            connection.query('select `' + table + '`.* from `' + table + '` WHERE `' + table + '`.idUser="' + userLogged.id + '"', function(err, docs) {
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
                userLogged = req.user,
                sql = '';

            sql += 'update `' + table + '` set ';
            sql += '`name`= "' + req.body.name + '", ';
            sql += '`idClient`= "' + req.body.idClient + '", ';
            sql += '`status`= "' + req.body.status + '" ';
            sql += '`price`= "' + req.body.price + '" ';
            sql += '`dateAdded`= "' + req.body.dateAdded + '" ';
            sql += '`dateEstimated`= "' + req.body.dateEstimated + '" ';
            sql += ' where `id`="' + id + '" AND `idUser`="' + userLogged.id + '"';

            connection.query(sql, function(err) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                res.send(true);
            });
        },

        add: function(req, res) {
            var data = req.body,
                userLogged = req.user,
                sql = '';

            sql += 'insert into `' + table + '` ';
            sql += '(`idUser`, `idClient`, `name`, `status`, `price`, `dateAdded`, `dateEstimated`) values ';
            sql += '("' + userLogged.id + '", "' + data.idClient + '", "' + data.name + '", "' + data.status + '", "' + data.price + '", "' + data.dateAdded + '", "' + data.dateEstimated + '")';

            // @todo use knex (http://knexjs.org/#Builder-insert)
            connection.query(sql, function(err, newItem) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                getById(newItem.insertId, userLogged.id, function(err, docs) {
                    if (err) { return res.send(503, { error: 'Database error'}); }
                    if (!docs) { return res.send(410, { error: 'Record not found'}); }

                    res.send(201, docs[0]);
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

                        res.send(204);
                    });
                }
            });
        }
    };

};