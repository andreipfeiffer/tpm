module.exports = function(connection) {

    'use strict';

    var table = 'projects';

    var getById = function(id, idUser, callback) {
        connection.query('select * from `' + table + '` where `id`="' + id + '" and `idUser`="' + idUser + '" and `isDeleted`="0"', function(err, docs) {
            callback(err, docs);
        });
    };

    var insertStatusChange = function(params, forced, callback) {
        var sql = '';

        connection.query('select `status` from `' + table + '` where `id`="' + params.idProject + '" and `idUser`="' + params.idUser + '"', function(err, docs) {

            // make a log entry only if the status has changed
            if (forced || docs[0].status !== params.status) {

                sql += 'insert into `projects_status_log` ';
                sql += '(`idUser`, `idProject`, `status`) values ';
                sql += '( "' + params.idUser + '"';
                sql += ', "' + params.idProject + '"';
                sql += ', "' + params.status + '" )';

                connection.query(sql, function(err) {
                    callback(err);
                });
            } else {
                callback(err);
            }
        });

    };

    return {
        getAll: function(req, res) {
            var userLogged = req.user;
            connection.query('select `' + table + '`.* from `' + table + '` WHERE `' + table + '`.idUser="' + userLogged.id + '" and `isDeleted`="0"', function(err, docs) {
                if (err) { return res.status(503).send({ error: 'Database error'}); }

                res.send(docs);
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
                userLogged = req.user,
                sql = '',
                dataStatusChange = {};

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

            dataStatusChange = {
                idUser: userLogged.id,
                idProject: id,
                status: req.body.status
            };

            insertStatusChange(dataStatusChange, false, function(err) {
                if (err) { return res.status(503).send({ error: 'Database error'}); }

                connection.query(sql, function(err) {
                    if (err) { return res.status(503).send({ error: 'Database error'}); }

                    res.send(true);
                });
            });

        },

        add: function(req, res) {
            var data = req.body,
                userLogged = req.user,
                dataStatusChange = {};

            function addNewProject() {
                var sql = '';

                sql += 'insert into `' + table + '` ';
                sql += '(`idUser`, `idClient`, `name`, `status`, `days`, `priceEstimated`, `priceFinal`, `dateAdded`, `dateEstimated`, `description`) values ';
                sql += '("' + userLogged.id + '", "' + data.idClient + '", "' + data.name + '", "' + data.status + '", "' + data.days + '", "' + data.priceEstimated + '", "' + data.priceFinal + '", "' + data.dateAdded + '", "' + data.dateEstimated + '", "' + data.description + '")';

                connection.query(sql, function(err, newItem) {
                    if (err) { return res.status(503).send({ error: 'Database error'}); }

                    getById(newItem.insertId, userLogged.id, function(err, docs) {
                        if (err) { return res.status(503).send({ error: 'Database error'}); }
                        if (!docs.length) { return res.status(410).send({ error: 'Record not found'}); }

                        dataStatusChange = {
                            idUser: userLogged.id,
                            idProject: newItem.insertId,
                            status: data.status
                        };

                        insertStatusChange(dataStatusChange, true, function(err) {
                            if (err) { return res.status(503).send({ error: 'Database error'}); }

                            res.status(201).send(docs[0]);
                        });
                    });
                });
            }

            if ( data.newClientName.length ) {
                // insert new client first, to get the ID
                connection.query('insert into `clients` (`idUser`, `name`) values ("' + userLogged.id + '", "' + data.newClientName + '")', function(err, newItem) {
                    if (err) { return res.status(503).send({ error: 'Database error'}); }

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
                if (err) { return res.status(503).send({ error: 'Database error'}); }

                if ( docs.length === 0 ) {
                    return res.status(404).send({ error: 'id "' + id + '" was not found'});
                } else {

                    sql += 'update `' + table + '` set ';
                    sql += '`isDeleted`= "1" ';
                    sql += ' where `id`="' + id + '" and `idUser`="' + userLogged.id + '" and `isDeleted`="0"';

                    connection.query(sql, function(err) {
                        if (err) { return res.status(503).send({ error: 'Database error'}); }

                        res.status(204).end();
                    });
                }
            });
        }
    };

};