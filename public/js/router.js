/*jshint unused: false*/

(function() {

    'use strict';

    TPM.Router.map(function () {
        this.route('login');
        this.route('logout');
        this.route('clients');

        this.resource('projects',    {path:'/projects' });
        this.resource('project.new', {path:'/project/new'});  
        this.resource('project',     {path:'/project/:id'}, function(){
            this.route('edit');
        });
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
            return this.get('store').find('project');
        }
    });
    TPM.ProjectRoute = TPM.AuthenticatedRoute.extend({
        model: function(params) {
            return this.store.find('project', params.id);
        }
    });    
    TPM.ProjectNewRoute = TPM.AuthenticatedRoute.extend({
        setupController: function(controller, model) {
            this._super(controller, model);
            controller.set('clients', this.get('store').find('client'));
        }
    });
    TPM.ProjectEditRoute = TPM.AuthenticatedRoute.extend({
        model: function(params) {
            return this.store.find('project', params.id);
        }
    });

    TPM.ClientsRoute = TPM.AuthenticatedRoute.extend({
        model: function () {
            return this.get('store').find('client');
        }
    });

})();
