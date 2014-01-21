(function() {

    'use strict';

    TPM.Project = DS.Model.extend({
        // id: DS.attr('number'),
        idUser: DS.attr('number'),
        idClient: DS.attr('number'),
        // nameClient: DS.attr('string'),
        name: DS.attr('string'),
        isCompleted: DS.attr('boolean'),
        client: DS.belongsTo('client')
    });

})();