/*jshint unused: false*/

(function() {

    'use strict';

    TPM.Router.map(function () {
        this.route('login');
        this.route('logout');
        this.resource('projects');
    });

    /**
        Index Route
        Redirect to Login
     */
    TPM.IndexRoute = Ember.Route.extend({
        beforeModel: function(transition) {
            this.transitionTo('login');
        }
    });

    TPM.LoginRoute = Ember.Route.extend({
        beforeModel: function(transition) {
            if (this.controllerFor('login').get('authToken')) {
                console.log('Already logged in');
                this.transitionTo('projects');
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

    TPM.LogoutRoute = Ember.Route.extend({
        setupController: function(controller, context) {
            this.controllerFor('login').set('authToken', '');
            this.transitionTo('login');
        }
    });

    TPM.AuthenticatedRoute = Ember.Route.extend({

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

    TPM.ProjectsRoute = TPM.AuthenticatedRoute.extend({
        model: function () {
            // return only the items from the logged user (in case previously logged in as another user)
            // return this.get('store').findQuery('project', { idUser: localStorage.authUserId });
            return this.get('store').find('project');
        }
    });

})();
