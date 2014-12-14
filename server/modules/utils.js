module.exports = (function() {

    'use strict';

    var server = require('../../server'),
        app = server.app,
        knex = server.knex;

    app.on('logError', function(o) {
        knex('error_log').insert({
            idUser: o.idUser,
            source: o.source,
            data: o.data || '',
            error: JSON.stringify( o.error )
        }).then(function() {
            console.error('[tpm_error]: ' + new Date().toString());
            console.trace(o);
        }).catch(function(err) {
            console.error(err);
        });
    });
})();