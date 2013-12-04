module.exports = function(connection) {

    'use strict';

    var getTodoById = function(id, idUser, callback) {
        connection.query('select * from `todos` where `id`="' + id + '" AND `idUser`="' + idUser + '"', function(err, docs) {
            callback(err, docs);
        });
    };

    return {
        getAll: function(req, res) {
            var userLogged = req.user;
            connection.query('select * from `todos` where `idUser`="' + userLogged.id + '"', function(err, docs) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                res.send({'todos': docs});
            });
        },

        getById: function(req, res) {
            var id = req.params.id,
                userLogged = req.user;

            getTodoById(id, userLogged.id, function(err, docs) {
                if (err) { return res.send(503, { error: 'Database error'}); }
                if (!docs) { return res.send(410, { error: 'Record not found'}); }

                res.send({'todo': docs[0]});
            });
        },

        update: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            // @todo handle all update variations
            connection.query('update `todos` set `isCompleted`=' + req.body.todo.isCompleted + ' where `id`="' + id + '" AND `idUser`="' + userLogged.id + '"', function(err) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                res.send(true);
            });
        },

        add: function(req, res) {
            var data = req.body.todo,
                userLogged = req.user;

            connection.query('insert into `todos` (`idUser`, `title`, `isCompleted`) values ("' + userLogged.id + '", "' + data.title + '", "' + data.isCompleted + '")', function(err, newItem) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                getTodoById(newItem.insertId, userLogged.id, function(err, docs) {
                    if (err) { return res.send(503, { error: 'Database error'}); }
                    if (!docs) { return res.send(410, { error: 'Record not found'}); }

                    // need to return an object that contains all the data including the database id
                    // so Ember can update its store, with the new ID from database
                    res.send({'todo': docs[0]});
                });
            });

        },

        remove: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            connection.query('select `id` from `todos` where `idUser`="' + userLogged.id + '" AND `id`="' + id + '"', function(err, docs) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                if ( docs.length === 0 ) {
                    return res.send(404, { error: 'id "' + id + '" was not found'});
                } else {
                    connection.query('delete from `todos` where `idUser`="' + userLogged.id + '" AND `id`="' + id + '"', function(err) {
                        if (err) { return res.send(503, { error: 'Database error'}); }

                        res.send(true);
                    });
                }
            });
        }
    };

};