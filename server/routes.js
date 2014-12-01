module.exports = function(app, knex) {

    'use strict';

    var auth  = require('./modules/auth')( knex ),
        authGoogle  = require('./modules/authGoogle')( knex ),
        passport = require('passport'),
        clients = require('./modules/clients')( knex ),
        projects = require('./modules/projects')( knex ),
        settings = require('./modules/settings')( knex ),
        pack = require('../package.json');

    app.get('/', function(req, res) {
        res.render('index', {
            title: pack.name,
            description: pack.description,
            version: pack.version
        });
    });

    app.post('/login', auth.login);
    app.get('/logout', auth.logout);

    app.route('/projects')
        .get(auth.ensureTokenAuthenticated, projects.getAll)
        .post(auth.ensureTokenAuthenticated, projects.add);

    app.route('/projects/:id')
        .get(auth.ensureTokenAuthenticated, projects.getById)
        .put(auth.ensureTokenAuthenticated, projects.update)
        .delete(auth.ensureTokenAuthenticated, projects.remove);

    app.route('/clients')
        .get(auth.ensureTokenAuthenticated, clients.getAll)
        .post(auth.ensureTokenAuthenticated, function(req, res) {
            clients.add(req).then(function(r) {
                return res.status( r.status ).send( r.data );
            });
        });

    app.route('/clients/:id')
        .get(auth.ensureTokenAuthenticated, clients.getById)
        .put(auth.ensureTokenAuthenticated, clients.update)
        .delete(auth.ensureTokenAuthenticated, clients.remove);

    app.route('/settings')
        .get(auth.ensureTokenAuthenticated, settings.getAll);

    app.route('/settings/google/:calendarId')
        .put(auth.ensureTokenAuthenticated, settings.setCalendar);

    app.route('/auth/google')
        .get(auth.ensureSessionAuthenticated, passport.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/calendar'
            ],
            accessType: 'offline'
        }))
        .delete(auth.ensureTokenAuthenticated, authGoogle.revokeAccess);

    app.get('/auth/google/callback',
        auth.ensureSessionAuthenticated,
        authGoogle.callback
    );

};