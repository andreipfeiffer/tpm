window.Todos = Ember.Application.create();

Todos.config = {
    urlApi: 'http://localhost:3000'
};

// Todos.ApplicationAdapter = DS.FixtureAdapter.extend();

// Todos.ApplicationAdapter = DS.LSAdapter.extend({
//  namespace: 'todos-emberjs'
// });

Todos.ApplicationAdapter = DS.RESTAdapter.extend({
    host: Todos.config.urlApi
});

/*Todos.Auth = Ember.Auth.extend({
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
