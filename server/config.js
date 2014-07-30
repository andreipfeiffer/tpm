/*jshint laxbreak: true*/

module.exports = (function(){
    switch(process.env.NODE_ENV) {

        case 'production':
            return {
                port: 3001,
                mysql: {
                    host: 'localhost',
                    user: 'root',
                    password: '',
                    database: 'tpm'
                }
            };
            break;

        case 'development':
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
