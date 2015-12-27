module.exports = {
    port: 3030,
    mysql: {
        host    : 'localhost',
        user    : 'root',
        password: 'root',
        database: 'tpm_test'
    },
    google: {
        clientID    : '884230170474-ndnan3kql7s5dd7rg7o5botd92d2fitl.apps.googleusercontent.com',
        clientSecret: '7ulfAHdrB6NGPuplrUGh8eYq',
        redirectURL : '/auth/google/callback'
    },
    // in seconds
    sessionExpirationTime: 60 * 60
};
