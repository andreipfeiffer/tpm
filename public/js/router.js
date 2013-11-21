Todos.Router.map(function () {
	this.resource('todos');
});

// Todos.TodosIndexRoute = Ember.Route.extend({
//   model: function () {
//     return this.modelFor('todos');
//   }
// });

Todos.TodosRoute = Ember.Route.extend({
	model: function () {
		// return this.get('store').findAll('todo');
		return this.get('store').find('todo');
		// return Ember.$.getJSON('http://localhost:4730/todos')
	}
});
