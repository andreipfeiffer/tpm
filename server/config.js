module.exports = (function(){

    'use strict';

    switch (process.env.NODE_ENV) {

        case 'production':
            return {
                port: 3001,
                mysql: {
                    host: 'localhost',
                    user: 'root',
                    password: '',
                    database: 'upsidedown_ro_tpm'
                }
            };

        default:
            return {
                port: (process.env.PORT || 3000),
                mysql: {
                    host: 'localhost',
                    user: 'root',
                    password: '',
                    database: 'tpm'
                }
            };
    }
})();
