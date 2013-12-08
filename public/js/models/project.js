(function() {

    'use strict';

    TPM.Project = DS.Model.extend({
        // id: DS.attr('number'),
        idUser: DS.attr('number'),
        idClient: DS.attr('number'),
        name: DS.attr('string'),
        isCompleted: DS.attr('boolean')
    });

})();