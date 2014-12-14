module.exports = (function() {

    'use strict';

    var server = require('../../server'),
        knex = server.knex;

    server.app.on('logError', function(o) {

        console.error('[tpm_error]: ' + new Date().toString());
        console.trace(o);

        return knex('error_log')
            .insert({
                idUser: o.idUser,
                source: o.source,
                data: o.data || '',
                error: JSON.stringify( o.error )
            });
    });
})();