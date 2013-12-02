Todos.ApplicationController = Ember.Controller.extend({
	needs: ['login'],
	isAuthenticated: Ember.computed.alias('controllers.login.authToken')
});