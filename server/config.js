module.exports = (function(){

    'use strict';

    switch (process.env.NODE_ENV) {

        case 'production':
            // this file should not be commited to git
            return require('./config.production');

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
