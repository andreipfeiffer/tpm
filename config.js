module.exports = (function(){

    'use strict';

    switch (process.env.NODE_ENV) {

        case 'production':
            return require('./config/config.production');

        case 'test':
            return require('./config/config.test');

        default:
            return require('./config/config._local');
    }
})();
