module.exports = function(connection, knex) {

    'use strict';

    var crypto = require('crypto'),
        passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        authGoogle  = require('./authGoogle')( knex );

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

    function md5(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    }

    // var saltAndHash = function(pass, callback) {
    //     var salt = generateSalt();
    //     callback(salt + md5(pass + salt));
    // };

    function validatePassword(plainPass, hashedPass) {
        var salt = hashedPass.substr(0, 10);
        var validHash = salt + md5(plainPass + salt);
        return (hashedPass === validHash);
    }

    function findUserById(id) {
        return knex('users').select().where({ id: id, isDeleted: '0' });
    }

    function findUserByUsername(username) {
        return knex('users').select().where({ email: username, isDeleted: '0' });
    }

    function findUserByToken(token, sessionID) {
        return knex('users').select().where({ authToken: token, sessionID: sessionID, isDeleted: '0' });
    }

    function findUserBySession(sessionID) {
        return knex('users').select().where({ sessionID: sessionID, isDeleted: '0' });
    }

    // used for initial username/password authentication
    var localStrategyAuth = new LocalStrategy(
        function(username, password, done) {
            // saltAndHash(password, function(resp) {
            //     console.log(resp);
            // });

            findUserByUsername(username).then(function(data) {
                var user = data[0];
                // console.log(user);
                if (!user) {
                    done(null, false, { message: 'Incorrect username.' });
                } else if (validatePassword(password, user.password) === false) {
                    done(null, false, { message: 'Incorrect password.' });
                } else {
                    return done(null, user);
                }
            }).catch(function(e) {
                done(null, false, { message: 'Database error.' });
            });
        }
    );

    function serializeUser(user, done) {
        done(null, user.id);
    }

    function deserializeUser(id, done) {
        findUserById(id).then(function(user) {
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        }).catch(function(e) {
            done(null, false);
        });
    }

    function login(req, res, next) {
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
                var updateAuthData = knex('users')
                    .where({
                        'id': user.id
                    })
                    .update({
                        authToken: newAuthToken,
                        sessionID: req.sessionID
                    });

                updateAuthData.then(function() {
                    return authGoogle.getTokens(user.id);
                }).then(function(data) {
                    if (data[0].accessToken.length) {
                        authGoogle.setTokens(data[0].accessToken, data[0].refreshToken);
                        authGoogle.refreshToken(user.id, function(newToken) {
                            // loggedData.googleToken = newToken;
                            return res.status(200).json(loggedData);
                        });
                    } else {
                        return res.status(200).json(loggedData);
                    }

                }).catch(function(e) {
                    return res.status(503).send({ error: 'Database error: ' + e.code});
                });
            });
        })(req, res, next);
    }

    function logout(req, res) {
        knex('users')
            .where({ id: req.user.id })
            .update({ authToken: '', sessionID: '' })
            .then(function() {
                req.logout();
                return res.status(200).end();
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
    }

    function ensureTokenAuthenticated(req, res, next) {
        var token = req.headers.authorization;

        findUserByToken(token, req.sessionID).then(function(data) {
            var user = data[0];
            if (!user) { return res.status(401).end(); }

            // add the logged user's data in the request, so the "next()" method can access it
            req.user = user;
            return next();
        }).catch(function(e) {
            return res.status(503).send({ error: 'Database error: ' + e.code});
        });
    }

    function ensureSessionAuthenticated(req, res, next) {
        findUserByToken(req.sessionID).then(function(data) {
            var user = data[0];

            if (!user) { return res.status(401).end(); }

            // add the logged user's data in the request, so the "next()" method can access it
            req.user = user;
            return next();
        }).catch(function(e) {
            return res.status(503).send({ error: 'Database error: ' + e.code});
        });
    }

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