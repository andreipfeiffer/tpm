module.exports = (() => {

    'use strict';

    var user = {
        credentials: {
            username: 'asd',
            password: 'asdasd'
        },
        authData: {}
    };

    return {
        loggedUser: user,

        setAuthData(authData) {
            user.authData = authData;
        },

        getAuthData() {
            return user.authData;
        },

        getUserId() {
            return user.authData.authUserId;
        },

        authenticateUser(agent) {
            var d = Promise.defer();

            agent
                .post('/login')
                .send( user.credentials )
                .end((err, res) => {
                    if (err) {
                        d.reject(err);
                    } else {
                        d.resolve(res);
                    }
                });

            return d.promise;
        },

        logoutUser(agent) {
            var d = Promise.defer();

            agent
                .get('/logout')
                .end((err, res) => d.resolve(res));

            return d.promise;
        }

    };

})();
