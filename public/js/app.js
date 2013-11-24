window.Todos = Ember.Application.create();

Todos.config = {
	urlApi: 'http://localhost:3000'
};

// Todos.ApplicationAdapter = DS.FixtureAdapter.extend();

// Todos.ApplicationAdapter = DS.LSAdapter.extend({
// 	namespace: 'todos-emberjs'
// });

Todos.ApplicationAdapter = DS.RESTAdapter.extend({
	host: Todos.config.urlApi
});

// Ember.$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
// 	if (!jqXHR.crossDomain) {
// 		jqXHR.setRequestHeader('X-Auth-Token', Todos.Session.get('authToken'));
// 	}
// });
