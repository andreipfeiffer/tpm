module.exports = function(knex) {

    'use strict';

    return {
        logError: function(o) {

            console.error('[tpm_error]: ' + new Date().toString());
            console.trace(o);

            return knex('error_log')
                .insert({
                    idUser: o.idUser,
                    source: o.source,
                    data: o.data || '',
                    error: JSON.stringify( o.error )
                });
        }
    };

};