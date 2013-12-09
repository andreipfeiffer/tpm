(function() {

    'use strict';

    TPM.Client = DS.Model.extend({
        // id: DS.attr('number'),
        idUser: DS.attr('number'),
        name: DS.attr('string')
    });

})();