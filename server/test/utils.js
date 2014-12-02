module.exports = (function(){

    'use strict';

    var promise = require('node-promise'),
        deferred = promise.defer;

    var user = {
        credentials: {
            username: 'asd',
            password: 'asdasd'
        },
        authData: {}
    };

    return {
        loggedUser: user,

        setAuthData: function(authData) {
            user.authData = authData;
        },

        getAuthData: function() {
            return user.authData;
        },

        getUserId: function() {
            return user.authData.authUserId;
        },

        authenticateUser: function(agent) {
            var d = deferred();

            agent
                .post('/login')
                .send( user.credentials )
                .end(function(err, res) {
                    if (err) {
                        d.reject(err);
                    } else {
                        d.resolve(res);
                    }
                });

            return d.promise;
        }
    };

})();
