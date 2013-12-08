(function() {

    'use strict';

    TPM.LoginController = Ember.Controller.extend({
        needs: ['projects'],

        reset: function() {
            this.setProperties({
                username: '',
                password: '',
                errorMessage: ''
            });
        },

        isLoading: false,
        authToken: localStorage.authToken,
        authUserId: localStorage.authUserId,

        tokenChanged: function() {
            localStorage.authToken = this.get('authToken');
        }.observes('authToken'),

        userIdChanged: function() {
            localStorage.authUserId = this.get('authUserId');
        }.observes('authUserId'),

        actions: {
            login: function() {
                var self = this, 
                    data = this.getProperties('username', 'password');

                if (this.get('isLoading')) {
                    return;
                }

                // Clear out any error messages.
                this.set('errorMessage', '');
                this.set('isLoading', true);

                $.post(TPM.config.urlApi + '/login', data).then(
                    function(response) {
                        self.set('isLoading', false);

                        if (response.error) {
                            self.set('errorMessage', response.error);
                        } else {
                            // console.log(response);
                            self.set('authToken', response.authToken);
                            self.set('authUserId', response.authUserId);

                            // this clears the store (temp method until EmberData supports clear/unload data)
                            self.get('store').init();

                            var attemptedTransition = self.get('attemptedTransition');
                            if (attemptedTransition) {
                                attemptedTransition.retry();
                                self.set('attemptedTransition', null);
                            } else {
                                self.transitionToRoute('projects');
                            }
                        }
                    },
                    function(res) {
                        console.log(res);
                        self.set('isLoading', false);
                        self.set('errorMessage', 'Please try again, because something unexpected has happened. ');
                    }
                );
            }
        }
    });

})();