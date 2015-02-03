module.exports = (function() {

    'use strict';

    var server = require('../../server'),
        app = server.app,
        knex = server.knex;

    function logError(o) {

        var _data = (typeof o.data !== 'undefined') ? JSON.stringify( o.data ) : '';

        knex('error_log').insert({
            idUser: o.idUser || 0,
            source: o.source || '',
            data: _data,
            error: JSON.stringify( o.error )
        }).then(function() {
            console.error('[tpm_error]: ' + new Date().toString());
            console.trace(o);
        }).catch(function(err) {
            console.error(err);
        });
    }

    app.on('logError', function(o) {
        logError(o);
    });

})();