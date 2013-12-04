(function() {

    'use strict';

    Todos.TodosController = Ember.ArrayController.extend({
        actions: {
            createTodo: function () {
                // Get the todo title set by the "New Todo" text field
                var title = this.get('newTitle');

                if (!title.trim()) {
                    // alert('Please fill in the title');
                    return;
                }

                // Create the new Todo model
                var todo = this.store.createRecord('todo', {
                    idUser: localStorage.authUserId,
                    title: title,
                    isCompleted: false
                });

                // Clear the "New Todo" text field
                this.set('newTitle', '');

                // Save the new model
                todo.save();
            }
        },

        remaining: function () {
            return this.filterBy('isCompleted', false).get('length');
        }.property('@each.isCompleted'),

        inflection: function () {
            var remaining = this.get('remaining');
            return remaining === 1 ? 'item' : 'items';
        }.property('remaining')
    });

})();