module.exports = function(knex) {

    'use strict';

    var config = require('../../config'),
        google = require('googleapis'),
        OAuth2 = google.auth.OAuth2,
        oauth2Client = new OAuth2(
            config.google.clientID,
            config.google.clientSecret,
            config.google.redirectURL
        );

    function setTokens(accessToken, refreshToken) {
        accessToken && (oauth2Client.credentials['access_token'] = accessToken);
        refreshToken && (oauth2Client.credentials['refresh_token'] = refreshToken);
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

    function updateTokens(userData) {
        setTokens(userData.googleOAuthToken, userData.googleOAuthRefreshToken);
    }

    function refreshAccessToken(userId, callback) {
        oauth2Client.refreshAccessToken(function(err, tokens) {
            if ( !tokens ) {
                clearTokens(userId).then(function() {
                    callback(null);
                });
                return;
            }

            knex('users')
                .where({ id: userId })
                .update({ googleOAuthToken: tokens['access_token'] })
                .then(function() {
                    callback(tokens['access_token']);
                });
        });
    }

    function clearTokens(userId) {
        return knex('users')
            .where({ id: userId })
            .update({
                googleOAuthToken: '',
                googleOAuthRefreshToken: '',
                googleSelectedCalendar: ''
            });
    }

    return {
        oauth2Client: oauth2Client,
        setTokens: setTokens,
        getTokens: getTokens,
        updateTokens: updateTokens,
        clearTokens: clearTokens,
        refreshAccessToken: refreshAccessToken
    };
};