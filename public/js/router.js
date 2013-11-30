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
        if (this.controllerFor('login').get('token')) {
            this.transitionTo('todos');
        }
    },
    setupController: function(controller, context) {
        // controller.reset();
    },
    actions: {
        loading: function(transition, originRoute) {
            console.log('loading');
        }
    }
});

Todos.LogoutRoute = Ember.Route.extend({
    setupController: function(controller, context) {
        this.controllerFor('login').set('token', '');
        this.transitionTo('login');
    }
});

Todos.AuthenticatedRoute = Ember.Route.extend({

    beforeModel: function(transition) {
        if (!this.controllerFor('login').get('token')) {
            this.redirectToLogin(transition);
        }
    },

    redirectToLogin: function(transition) {
        alert('You must log in!');

        var loginController = this.controllerFor('login');
        loginController.set('attemptedTransition', transition);
        this.transitionTo('login');
    },

    getJSONWithToken: function(url) {
        var token = this.controllerFor('login').get('token');
        return $.getJSON(url, { token: token });
    },

    actions: {
        error: function(reason, transition) {
            if (reason.status === 401) {
                this.redirectToLogin(transition);
            } else {
                alert('Something went wrong');
            }
        }
    }
});

Todos.TodosRoute = Todos.AuthenticatedRoute.extend({
    model: function () {
        return this.get('store').find('todo');
    }
});
