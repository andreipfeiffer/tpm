(function() {

    'use strict';

    TPM.ClientsController = Ember.ArrayController.extend({
        actions: {
            createClient: function () {
                var name = this.get('newClientName');

                if (typeof name === 'undefined' || name.trim() === '') {
                    // alert('Please fill in the name');
                    return;
                }

                // Create the new client model
                var client = this.store.createRecord('client', {
                    idUser: localStorage.authUserId,
                    name: name,
                    isCompleted: false
                });

                // Clear the "New client" text field
                this.set('newClientName', '');

                // Save the new model
                client.save();
            }
        }
    });

})();