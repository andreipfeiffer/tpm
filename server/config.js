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
                },
                google: {
                    clientID: '884230170474-ndnan3kql7s5dd7rg7o5botd92d2fitl.apps.googleusercontent.com',
                    clientSecret: '7ulfAHdrB6NGPuplrUGh8eYq',
                }
            };
    }
})();
