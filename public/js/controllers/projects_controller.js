(function() {

    'use strict';

    TPM.ProjectsController = Ember.ArrayController.extend({
        remaining: function() {
            return this.filterBy('isCompleted', false).get('length');
        }.property('@each.isCompleted'),

        inflection: function() {
            var remaining = this.get('remaining');
            return remaining === 1 ? 'item' : 'items';
        }.property('remaining')
    });

    TPM.ProjectNewController = Ember.ArrayController.extend({
        actions: {
            createProject: function() {
                // Get the project title set by the 'New project' text field
                var name = this.get('newProjectName'),
                    client = this.get('newProjectClient');

                if ( !name || !name.trim() ) {
                    // alert('Please fill in the name');
                    return;
                }
                if ( !client.id ) {
                    // alert('Please select a client');
                    return;
                }

                // Create the new project model
                var project = this.store.createRecord('project', {
                    idUser: localStorage.authUserId,
                    idClient: client.id,
                    name: name,
                    isCompleted: false
                });

                // Clear the 'New project' text field
                this.set('newProjectName', '');

                // Save the new model
                project.save();
            }
        }
    });

})();