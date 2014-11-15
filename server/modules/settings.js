module.exports = function(connection) {

    'use strict';

    var request = require('request');

    var getGoogleToken = function(idUser, callback) {
        var q;

        q = 'select `googleOAuthToken` from `users` where `id`="' + idUser + '" and `isDeleted`="0"';

        connection.query(q, function(err, docs) {
            if (err) { callback(null, err); }
            callback(err, docs[0].googleOAuthToken);
        });
    };

    return {
        getAll: function(req, res) {
            var userLogged = req.user,
                result = {};

            getGoogleToken(userLogged.id, function(err, token) {
                if (err) { return res.status(503).send({ error: 'Database error'}); }

                result.googleToken = !!token.length;
                res.send(result);
            });
        },

        revokeAcces: function(req, res) {
            var userLogged = req.user,
                q;

            q = 'select `googleOAuthToken` from `users` where `id`="' + userLogged.id + '" and `isDeleted`="0"';

            connection.query(q, function(err, docs) {
                if (err) { return res.status(503).send({ error: 'Database error: '}); }

                request.get('https://accounts.google.com/o/oauth2/revoke?token='+docs[0].googleOAuthToken, function (err, resGoogle, body) {
                    if (!err) {
                        connection.query('update `users` set `googleOAuthToken`="" where `id`="' + userLogged.id + '"', function(err/*, docs*/) {
                            if (err) { return res.status(503).send({ error: 'Database error: '}); }

                            res.send(body);
                        });
                    } else {
                        res.send(err);
                    }
                });

            });
        }
    };

};