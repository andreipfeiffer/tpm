module.exports = function(connection) {

    'use strict';

    var passport = require('passport'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        google = require('googleapis'),
        OAuth2 = google.auth.OAuth2,
        oauth2Client = new OAuth2(),
        config = require('../config'),
        auth = require('./auth')( connection );
    // var calendar = google.calendar('v3');

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

    google.options({ auth: oauth2Client });

    passport.use('google',
        new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: '/auth/google/callback',
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
            auth.storeGoogleOAuthToken(req.sessionID, accessToken, function(err, user) {
                oauth2Client.setCredentials({
                    'access_token': accessToken
                });
                done(err, user);
            });
        }
    ));

    return {
        callback: callback
        // logout: logout,
        // localStrategyAuth: localStrategyAuth,
        // ensureTokenAuthenticated: ensureTokenAuthenticated,
        // ensureSessionAuthenticated: ensureSessionAuthenticated,
        // serializeUser: serializeUser,
        // deserializeUser: deserializeUser,
        // storeGoogleOAuthToken: storeGoogleOAuthToken
    };
};