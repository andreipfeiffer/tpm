module.exports = function(knex) {

    'use strict';

    var passport = require('passport'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        config = require('../config'),
        google = require('googleapis'),
        OAuth2 = google.auth.OAuth2,
        oauth2Client = new OAuth2(
            config.google.clientID,
            config.google.clientSecret,
            config.google.redirectURL
        );

    function redirectCallback(req, res, next) {
        passport.authenticate('google', function(err, user/*, info*/) {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/#settings');
            });
        })(req, res, next);
    }

    function findUserBySession(sessionID, callback) {
        return knex('users').select().where({ sessionID: sessionID, isDeleted: '0' });
    }

    function storeGoogleOAuthToken(sessionID, token, refreshToken, done) {
        findUserBySession(sessionID).then(function(data) {
            var user = data[0];
            // refreshToken is provided only on first authentication
            // so we update only if provided
            var refreshTokenField = refreshToken ? ', `googleOAuthRefreshToken`="' + refreshToken + '"' : '';

            return knex.raw('update `users` set `googleOAuthToken`="' + token + '"' + refreshTokenField + ' where `id`="' + user.id + '"')
                .then(function() {
                    done(null, user);
                });
        }).catch(function(e) {
            done(err, false);
        });
    }

    function setTokens(accessToken, refreshToken) {
        var tokens = {
            'access_token': accessToken
        };

        if ( refreshToken ) {
            tokens['refresh_token'] = refreshToken;
        }

        oauth2Client.setCredentials(tokens);
        google.options({ auth: oauth2Client });
    }

    function getTokens(idUser) {
        return knex('users')
            .select('googleOAuthToken as accessToken', 'googleOAuthRefreshToken as refreshToken')
            .where({
                id: idUser,
                isDeleted: '0'
            });
    }

    function refreshToken(userId, callback) {
        oauth2Client.refreshAccessToken(function(err, tokens) {
            setTokens(tokens['access_token'], tokens['refresh_token']);
            knex('users')
                .where({ id: userId })
                .update({ googleOAuthToken: tokens['access_token'] })
                .then(function() {
                    callback(tokens['access_token']);
                });
        });
    }

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
        callback: redirectCallback,
        google: google,
        setTokens: setTokens,
        getTokens: getTokens,
        refreshToken: refreshToken
    };
};