(function() {

    'use strict';

    TPM.ClientView = Ember.TextField.extend({
        didInsertElement: function () {
            this.$().focus();
        }
    });

    Ember.Handlebars.helper('edit-client', TPM.ClientView);

})();