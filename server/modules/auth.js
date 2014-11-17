module.exports = function(connection) {

    'use strict';

    var crypto = require('crypto'),
        passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        authGoogle  = require('./authGoogle')( connection );

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
        connection.query('select * from `users` where `id`="' + id + '" and `isDeleted`="0"', function (err, user) {
            var result = user ? user[0] : null;
            callback(err, result);
        });
    };

    var findUserByUsername = function(username, callback) {
        connection.query('select * from `users` where `email`="' + username + '" and `isDeleted`="0"', function (err, user) {
            var result = user ? user[0] : null;
            callback(err, result);
        });
    };

    var findUserByToken = function(token, sessionID, callback) {
        connection.query('select * from `users` where `authToken`="' + token + '" and `sessionID`="' + sessionID + '" and `isDeleted`="0"', function (err, user) {
            var result = user ? user[0] : null;
            callback(err, result);
        });
    };

    var findUserBySession = function(sessionID, callback) {
        connection.query('select * from `users` where `sessionID`="' + sessionID + '" and `isDeleted`="0"', function (err, user) {
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
                return res.status(401).send({ error: 'Bad username or password'});
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
                connection.query('update `users` set `authToken`="' + newAuthToken + '", `sessionID`="' + req.sessionID + '" where `id`="' + user.id + '"', function () {
                    authGoogle.getTokens(user.id, function(err, token, refreshToken) {
                        if (err) { return res.status(503).send({ error: 'Database error'}); }

                        if (token.length) {
                            authGoogle.setTokens(token, refreshToken);
                            authGoogle.refreshToken(user.id, function(newToken) {
                                loggedData.googleToken = token;
                            });
                        }

                        res.status(200).json(loggedData);
                    });
                });

            });
        })(req, res, next);
    };

    var logout = function(req, res) {
        connection.query('update `users` set `authToken`="", `sessionID`="" where `id`="' + req.user.id + '"', function () {
            req.logout();
            return res.status(200).end();
        });
    };

    // @note: Need to protect all API calls (other than login/logout) with this check
    var ensureTokenAuthenticated = function(req, res, next) {
        var token = req.headers.authorization;

        findUserByToken(token, req.sessionID, function(err, user) {
            if (err) { return res.status(401).end(); }
            if (!user) { return res.status(401).end(); }

            // @todo refresh token ?!

            // add the logged user's data in the request, so the "next()" method can access it
            req.user = user;
            return next();
        });

    };

    var ensureSessionAuthenticated = function(req, res, next) {
        findUserBySession(req.sessionID, function(err, user) {
            if (err) { return res.status(401).end(); }
            if (!user) { return res.status(401).end(); }
            req.user = user;
            return next();
        });
    };

    // setup passport auth (before routes, after express session)
    passport.use(localStrategyAuth);
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);

    return {
        login: login,
        logout: logout,
        ensureTokenAuthenticated: ensureTokenAuthenticated,
        ensureSessionAuthenticated: ensureSessionAuthenticated
    };
};