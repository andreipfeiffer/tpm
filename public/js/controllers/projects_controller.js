(function() {

    'use strict';

    TPM.ProjectsController = Ember.ArrayController.extend({
        actions: {
            createProject: function () {
                // Get the project title set by the "New project" text field
                var name = this.get('newProjectName');

                if (typeof name === 'undefined' || name.trim() === '') {
                    // alert('Please fill in the name');
                    return;
                }

                // Create the new project model
                var project = this.store.createRecord('project', {
                    idUser: localStorage.authUserId,
                    name: name,
                    isCompleted: false
                });

                // Clear the "New project" text field
                this.set('newProjectName', '');

                // Save the new model
                project.save();
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