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

        authenticateUser(request) {
            return new Promise((resolve, reject) => {
                request
                    .post('/login')
                    .send( user.credentials )
                    .end((err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res);
                        }
                    });
            });
        },

        logoutUser(request) {
            return new Promise((resolve) => {
                request
                    .get('/logout')
                    .end((err, res) => resolve(res));
            });
        }

    };

})();
