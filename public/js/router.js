Todos.Router.map(function () {
    this.route('login');
    this.route('logout');
    this.resource('todos');
});

/**
    Index Route
    Redirect to Login
 */
Todos.IndexRoute = Ember.Route.extend({
    beforeModel: function(transition) {
        this.transitionTo('login');
    }
});

Todos.LoginRoute = Ember.Route.extend({
    beforeModel: function(transition) {
        if (this.controllerFor('login').get('authToken')) {
            console.log('Already logged in');
            this.transitionTo('todos');
        }
    },
    setupController: function(controller, context) {
        // controller.reset();
    },
    actions: {
        error: function(res) {
            console.log(res);
        }
    }
});

Todos.LogoutRoute = Ember.Route.extend({
    setupController: function(controller, context) {
        this.controllerFor('login').set('authToken', '');
        this.transitionTo('login');
    }
});

Todos.AuthenticatedRoute = Ember.Route.extend({

    beforeModel: function(transition) {
        if (!this.controllerFor('login').get('authToken')) {
            this.redirectToLogin(transition);
        }
    },

    redirectToLogin: function(transition) {
        var loginController = this.controllerFor('login');
        loginController.set('errorMessage', 'You need to login first!');
        loginController.set('attemptedTransition', transition);
        this.transitionTo('login');
    },

    // getJSONWithToken: function(url) {
    //     var authToken = this.controllerFor('login').get('authToken');
    //     return $.getJSON(url, { authToken: authToken });
    // },

    actions: {
        error: function(reason, transition) {
            this.controllerFor('login').set('authToken', '');
            this.transitionTo('login');
        }
    }
});

Todos.TodosRoute = Todos.AuthenticatedRoute.extend({
    model: function () {
        return this.get('store').find('todo');
    }
});
