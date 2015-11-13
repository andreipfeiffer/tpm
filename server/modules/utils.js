module.exports = (function() {

    'use strict';

    var server  = require('../../server'),
        app     = server.app,
        knex    = server.knex,
        promise = require('node-promise');

    function logError(o) {

        var d     = promise.defer(),
            _data = (typeof o.data !== 'undefined') ? JSON.stringify( o.data ) : '';

        knex('error_log').insert({
            idUser: o.idUser || 0,
            source: o.source || '',
            data  : _data,
            error : JSON.stringify( o.error )
        }).then(function() {
            console.error('[tpm_error]: ' + new Date().toString());
            console.trace(o);
            d.resolve();
        }).catch(function(err) {
            console.error(err);
            d.reject();
        });

        return d.promise;
    }


    return {
        init: function() {
            var self = this;

            app.on('logError', function(o) {
                self.logError(o);
            });
        },

        logError: function(o) {
            return logError(o);
        }
    };

})();