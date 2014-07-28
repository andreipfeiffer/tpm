module.exports = function(connection) {

    'use strict';

    var table = 'projects';

    var getById = function(id, idUser, callback) {
        connection.query('select * from `' + table + '` where `id`="' + id + '" and `idUser`="' + idUser + '" and `isDeleted`="0"', function(err, docs) {
            callback(err, docs);
        });
    };

    return {
        getAll: function(req, res) {
            var userLogged = req.user;
            connection.query('select `' + table + '`.* from `' + table + '` WHERE `' + table + '`.idUser="' + userLogged.id + '" and `isDeleted`="0"', function(err, docs) {
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
            sql += '`status`= "' + req.body.status + '", ';
            sql += '`days`= "' + req.body.days + '", ';
            sql += '`priceEstimated`= "' + req.body.priceEstimated + '", ';
            sql += '`priceFinal`= "' + req.body.priceFinal + '", ';
            sql += '`dateAdded`= "' + req.body.dateAdded + '", ';
            sql += '`dateEstimated`= "' + req.body.dateEstimated + '", ';
            sql += '`description`= "' + req.body.description + '" ';
            sql += ' where `id`="' + id + '" AND `idUser`="' + userLogged.id + '"';

            connection.query(sql, function(err) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                res.send(true);
            });
        },

        add: function(req, res) {
            var data = req.body,
                userLogged = req.user;

            function addNewProject() {
                var sql = '';

                sql += 'insert into `' + table + '` ';
                sql += '(`idUser`, `idClient`, `name`, `status`, `days`, `priceEstimated`, `priceFinal`, `dateAdded`, `dateEstimated`, `description`) values ';
                sql += '("' + userLogged.id + '", "' + data.idClient + '", "' + data.name + '", "' + data.status + '", "' + data.days + '", "' + data.priceEstimated + '", "' + data.priceFinal + '", "' + data.dateAdded + '", "' + data.dateEstimated + '", "' + data.description + '")';

                // @todo use knex (http://knexjs.org/#Builder-insert)
                connection.query(sql, function(err, newItem) {
                    if (err) { return res.send(503, { error: 'Database error'}); }

                    getById(newItem.insertId, userLogged.id, function(err, docs) {
                        if (err) { return res.send(503, { error: 'Database error'}); }
                        if (!docs) { return res.send(410, { error: 'Record not found'}); }

                        res.send(201, docs[0]);
                    });
                });
            }

            if ( data.newClientName.length ) {
                // insert new client first, to get the ID
                connection.query('insert into `clients` (`idUser`, `name`) values ("' + userLogged.id + '", "' + data.newClientName + '")', function(err, newItem) {
                    if (err) { return res.send(503, { error: 'Database error'}); }

                    data.idClient = newItem.insertId;
                    addNewProject();
                });
            } else {
                addNewProject();
            }

        },

        remove: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user,
                sql = '';

            connection.query('select `id` from `' + table + '` where `idUser`="' + userLogged.id + '" AND `id`="' + id + '" and `isDeleted`="0"', function(err, docs) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                if ( docs.length === 0 ) {
                    return res.send(404, { error: 'id "' + id + '" was not found'});
                } else {

                    sql += 'update `' + table + '` set ';
                    sql += '`isDeleted`= "1" ';
                    sql += ' where `id`="' + id + '" and `idUser`="' + userLogged.id + '" and `isDeleted`="0"';

                    connection.query(sql, function(err) {
                        if (err) { return res.send(503, { error: 'Database error'}); }

                        res.send(204);
                    });
                }
            });
        }
    };

};