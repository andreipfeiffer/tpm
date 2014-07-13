module.exports = function(connection) {

    'use strict';

    var crypto = require('crypto'),
        passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy;


    // private encryption & validation methods
    // var generateSalt = function() {
    //     var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    //     var salt = '';
    //     for (var i = 0; i < 10; i += 1) {
    //         var p = Math.floor(Math.random() * set.length);
    //         salt += set[p];
    //     }
    //     return salt;
    // };

    var md5 = function(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    };

    // var saltAndHash = function(pass, callback) {
    //     var salt = generateSalt();
    //     callback(salt + md5(pass + salt));
    // };

    var validatePassword = function(plainPass, hashedPass) {
        var salt = hashedPass.substr(0, 10);
        var validHash = salt + md5(plainPass + salt);
        return (hashedPass === validHash);
    };

    var findUserById = function(id, callback) {
        connection.query('select * from `users` where `id`="' + id + '"', function (err, user) {
            var result = user ? user[0] : null;
            callback(err, result);
        });
    };

    var findUserByUsername = function(username, callback) {
        connection.query('select * from `users` where `email`="' + username + '"', function (err, user) {
            var result = user ? user[0] : null;
            callback(err, result);
        });
    };

    var findUserByToken = function(token, callback) {
        connection.query('select * from `users` where `authToken`="' + token + '"', function (err, user) {
            var result = user ? user[0] : null;
            callback(err, result);
        });
    };

    // used for initial username/password authentication
    var localStrategyAuth = new LocalStrategy(
        function(username, password, done) {
            // saltAndHash(password, function(resp) {
            //     console.log(resp);
            // });
            findUserByUsername(username, function(err, user) {
                // console.log(user);
                if (!user) {
                    done(null, false, { message: 'Incorrect username.' });
                } else if (validatePassword(password, user.password) === false) {
                    done(null, false, { message: 'Incorrect password.' });
                } else {
                    return done(null, user);
                }
            });
        }
    );

    var serializeUser = function(user, done) {
        done(null, user.id);
    };

    var deserializeUser = function(id, done) {
        findUserById(id, function(err, user) {
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    };

    var login = function(req, res, next) {
        return passport.authenticate('local', function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.send(200, { error: 'Bad username or password'});
            }

            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }

                var newAuthToken = md5(String( new Date().getTime() )),
                    loggedData = {
                    authToken: newAuthToken,
                    authUserId: user.id
                };

                // update token in database
                connection.query('update `users` set `authToken`="' + newAuthToken + '" where `id`="' + user.id + '"', function () {
                    res.json(200, loggedData);
                });

            });
        })(req, res, next);
    };

    var logout = function(req, res) {
        req.logout();
        return res.send(200);
    };

    // NOTE: Need to protect all API calls (other than login/logout) with this check
    var ensureAuthenticated = function(req, res, next) {
        var token = req.headers.authorization;

        // @todo TEMPORARY REMOVE AUTH
        // req.user = {id: 1};
        // if (1) {
        //     return next();
        // }

        findUserByToken(token, function(err, user) {
            if (err) { return res.send(401); }
            if (!user) { return res.send(401); }

            // @todo refresh token ?!

            // add the logged user's data in the request, so the "next()" method can access it
            req.user = user;
            return next();
        });

    };

    // publics
    return {
        login: login,
        logout: logout,
        localStrategyAuth: localStrategyAuth,
        ensureAuthenticated: ensureAuthenticated,
        serializeUser: serializeUser,
        deserializeUser: deserializeUser
    };
};