Todos.LoginController = Ember.Controller.extend({

    reset: function() {
        this.setProperties({
            username: '',
            password: '',
            errorMessage: ''
        });
    },

    token: localStorage.token,

    tokenChanged: function() {
        localStorage.token = this.get('token');
    }.observes('token'),

    actions: {
        login: function() {

            var self = this, 
                data = this.getProperties('username', 'password');

            // Clear out any error messages.
            this.set('errorMessage', '');

            $.post(Todos.config.urlApi + '/login', data).then(function(response) {

                console.info(response);

                if (response.error) {
                    self.set('errorMessage', response.error);
                } else {
                    alert('Login succeeded!');
                    self.set('token', response.token);

                    var attemptedTransition = self.get('attemptedTransition');
                    if (attemptedTransition) {
                        attemptedTransition.retry();
                        self.set('attemptedTransition', null);
                    } else {
                        // Redirect to 'articles' by default.
                        self.transitionToRoute('todos');
                    }
                }
            });
        },

    }
});