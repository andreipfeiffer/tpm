module.exports = function(connection) {

    'use strict';

    var passport = require('passport'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        // auth = require('./auth')( connection ),
        config = require('../config'),
        google = require('googleapis'),
        OAuth2 = google.auth.OAuth2,
        oauth2Client = new OAuth2(
            config.google.clientID,
            config.google.clientSecret,
            config.google.redirectURL
        );

    var callback = function(req, res, next) {
        passport.authenticate('google', function(err, user/*, info*/) {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/#settings');
            });
        })(req, res, next);
    };

    var findUserBySession = function(sessionID, callback) {
        connection.query('select * from `users` where `sessionID`="' + sessionID + '" and `isDeleted`="0"', function (err, user) {
            var result = user ? user[0] : null;
            callback(err, result);
        });
    };

    var storeGoogleOAuthToken = function(sessionID, token, refreshToken, done) {
        findUserBySession(sessionID, function(err, user) {
            if (user) {
                connection.query('update `users` set `googleOAuthToken`="' + token + '", `googleOAuthRefreshToken`="' + refreshToken + '" where `id`="' + user.id + '"', function () {
                    done(null, user);
                });
            } else {
                done(err, false);
            }
        });
    };

    var setTokens = function(token, refreshToken) {
        google.options({ auth: oauth2Client });
        oauth2Client.setCredentials({
            'access_token': token,
            'refresh_token': refreshToken
        });
    };

    var getTokens = function(idUser, callback) {
        connection.query('select `googleOAuthToken`,`googleOAuthRefreshToken` from `users` where `id`="' + idUser + '" and `isDeleted`="0"', function(err, docs) {
            if (err) { callback(null, err); }
            callback(err, docs[0].googleOAuthToken, docs[0].googleOAuthRefreshToken);
        });
    };

    passport.use('google',
        new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.redirectURL,
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
            storeGoogleOAuthToken(req.sessionID, accessToken, refreshToken, function(err, user) {
                setTokens(accessToken, refreshToken);
                done(err, user);
            });
        }
    ));

    return {
        callback: callback,
        google: google,
        setTokens: setTokens,
        getTokens: getTokens
    };
};