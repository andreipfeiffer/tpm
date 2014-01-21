(function() {

    'use strict';

    TPM.ClientController = Ember.ObjectController.extend({
        isEditing: false,
        tempName: '',
        actions: {
            remove: function() {
                var model = this.get('model');
                model.deleteRecord();
                model.save();
            },
            edit: function() {
                // var model = this.get('model');
                this.set('isEditing', true);
                this.set('tempName', this.get('model.name'));
            },
            acceptChanges: function () {
                this.set('isEditing', false);
                this.set('tempName', this.get('model.name'));

                if (Ember.isEmpty(this.get('model.name'))) {
                    this.send('remove');
                } else {
                    this.get('model').save();
                }
            },
            cancelChanges: function () {
                this.set('isEditing', false);
                this.set('model.name', this.get('tempName'));
            }
        }
    });

})();