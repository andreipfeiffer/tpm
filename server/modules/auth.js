module.exports = function(knex) {

    'use strict';

    var crypto         = require('crypto'),
        passport       = require('passport'),
        LocalStrategy  = require('passport-local').Strategy,
        googleClient   = require('./googleClient')( knex ),
        server         = require('../../server'),
        jwt            = require('jsonwebtoken'),
        promise        = require('node-promise'),
        deferred       = promise.defer,
        secret         = 'upsidedown-inseamna-Lia-si-Andrei',
        moment         = require('moment'),
        maxIdleSeconds = 60 * 60;

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

    function findUserByUsername(username, timestamp) {
        return knex('users').select().where({ email: username, isDeleted: '0' });
    }

    function findUserBySession(sessionID) {
        return knex('users').select().where({ sessionID: sessionID, isDeleted: '0' });
    }

    function getCurrentTime() {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }

    function getIdleTime(lastActive) {
        var now    = getCurrentTime(),
            last   = lastActive,
            nowTS  = moment( now ).format('X'),
            lastTS = moment( last ).format('X');

        return (nowTS - lastTS);
    }

    function updateSession(userId, newSessionId, oldSessionId) {
        var data = {
                dateLastActive: getCurrentTime()
            };

        if ( newSessionId !== oldSessionId ) {
            data.sessionID = newSessionId;
            data.isLogged  = 1;
        }

        return knex('users')
            .where({
                'id': userId
            })
            .update( data );
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
            }).catch(function(/*e*/) {
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
            done(e, false);
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

                req.user = user;

                var newAuthToken = jwt.sign({ id: user.id }, secret),
                    loggedData = {
                        authToken : newAuthToken,
                        authUserId: user.id
                    };

                updateSession(user.id, req.sessionID).then(function() {
                    return googleClient.getTokens(user.id);
                }).then(function(data) {
                    if (data[0].accessToken.length && !data[0].refreshToken.length) {
                        setLoginError(user.id);
                        loggedData.googleAuthNeeded = true;
                        // googleAuth.revokeAccess(req, res);
                        return res.status(200).json(loggedData);
                    } else if (data[0].accessToken.length && data[0].refreshToken.length) {
                        googleClient.setTokens(data[0].accessToken, data[0].refreshToken);
                        googleClient.refreshAccessToken(user.id, function(/*newToken*/) {
                            // loggedData.googleToken = newToken;
                            return res.status(200).json(loggedData);
                        });
                    } else {
                        return res.status(200).json(loggedData);
                    }

                }).catch(function(err) {
                    return res.status(503).send({ error: 'Database error: ' + err.code});
                });
            });
        })(req, res, next);
    }

    function logout(req, res) {
        knex('users')
            .where({ id: req.user.id })
            .update({ sessionID: '', isLogged: 0 })
            .then(function() {
                req.logout();
                return res.status(200).end();
            }).catch(function(e) {
                return res.status(503).send({ error: 'Database error: ' + e.code});
            });
    }

    function ensureTokenAuthenticated(req, res, next) {
        var token = req.headers.authorization,
            decoded;

        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return res.status(401).send({ error: err.message});
        }

        findUserById(decoded.id).then(function(data) {
            var user = data[0],
                idle = getIdleTime( user.dateLastActive );

            if (!user || !user.isLogged || idle > maxIdleSeconds) {
                return res.status(401).end();
            }

            // verify session also
            // is server is restarted, session is updated
            updateSession(decoded.id, req.sessionID, user.sessionID).then(function() {
                // add the logged user's data in the request, so the "next()" method can access it
                req.user = user;
                return next();
            });

        }).catch(function(e) {
            return res.status(503).send({ error: 'Database error: ' + e.code});
        });
    }

    function ensureSessionAuthenticated(req, res, next) {
        findUserBySession(req.sessionID).then(function(data) {
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

    function setLoginError(idUser) {
        var log = {
            idUser: idUser,
            source: 'auth.login',
            error: { message: 'App login successfull, access_token available but no refresh_token in db' }
        };

        server.app.emit('logError', log);
    }

    return {
        login : login,
        logout: logout,
        ensureTokenAuthenticated  : ensureTokenAuthenticated,
        ensureSessionAuthenticated: ensureSessionAuthenticated
    };
};