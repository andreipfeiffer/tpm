(function() {

    'use strict';

    TPM.ClientController = Ember.ObjectController.extend({
        actions: {
            remove: function() {
                var model = this.get('model');
                model.deleteRecord();
                model.save();
            }
        }
    });

})();