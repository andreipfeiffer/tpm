window.TPM = Ember.Application.create();

(function() {

    'use strict';

    TPM.config = {
        urlApi: 'http://localhost:3000'
    };

    // TPM.ApplicationAdapter = DS.FixtureAdapter.extend();

    // TPM.ApplicationAdapter = DS.LSAdapter.extend({
    //  namespace: 'tpm-emberjs'
    // });

    TPM.ApplicationAdapter = DS.RESTAdapter.extend({
        host: TPM.config.urlApi
    });

    /*TPM.Auth = Ember.Auth.extend({
        request: 'jquery',
        response: 'json',

        strategy: 'token',
        tokenKey: 'authToken',
        tokenLocation: 'authHeader',
        tokenHeaderKey: 'Authorization',
        tokenIdKey: 'authUserId',

        session: 'local-storage',
        modules: ['emberData'],
        // emberData: {
        //     userModel: 'user'
        // }

        signInEndPoint: '/login' ,
        signOutEndPoint: '/logout'
    });*/

    Ember.$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        if (!jqXHR.crossDomain) {
            jqXHR.setRequestHeader('Authorization', localStorage.authToken);
        }
    });

})();
