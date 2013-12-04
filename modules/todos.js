module.exports = function(connection) {

    'use strict';

    return {
        getAll: function(req, res) {
            var userLogged = req.user;
            connection.query('select * from `todos` where `idUser`="' + userLogged.id + '"', function(err, docs) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                res.send({'todos': docs});
            });
        },

        /*getById: function(req, res) {
            var id = req.params.id,
                userLogged = req.user;

            if( isNaN(parseInt( req.params.id, 10 )) ) {
                return res.send('TypeError: a number is required');
            }

            console.log('Retrieving todo: ' + id);
            db.collection('todos', function(err, collection) {
                collection.findOne({'id': parseInt(id, 10)}, function(err, item) {

                    if (err) {
                        res.statusCode = 404;
                        return res.send('Error: something went wrong');
                    }

                    if (!item) {
                        res.statusCode = 404;
                        return res.send('Error 404: todo with id="' + id + '" was not found');
                    }

                    res.send(item);
                });
            });

        },*/

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

            connection.query('insert into `todos` (`idUser`, `title`, `isCompleted`) values ("' + userLogged.id + '", "' + data.title + '", "' + data.isCompleted + '")', function(err) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                res.send(true);
            });

        },

        remove: function(req, res) {
            var id = parseInt( req.params.id, 10 ),
                userLogged = req.user;

            connection.query('select `id` from `todos` where `idUser`="' + userLogged.id + '" AND `id`="' + id + '"', function(err, docs) {
                if (err) { return res.send(503, { error: 'Database error'}); }

                if ( docs.length === 0 ) {
                    res.statusCode = 404;
                    return res.send('id "' + id + '" was not found');
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