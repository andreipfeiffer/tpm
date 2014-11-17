module.exports = function(app, connection, knex) {

    'use strict';

    var auth  = require('./modules/auth')( connection ),
        authGoogle  = require('./modules/authGoogle')( connection ),
        passport = require('passport'),
        clients = require('./modules/clients')( knex ),
        projects = require('./modules/projects')( connection ),
        settings = require('./modules/settings')( connection ),
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
        .post(auth.ensureTokenAuthenticated, clients.add);

    app.route('/clients/:id')
        .get(auth.ensureTokenAuthenticated, clients.getById)
        .put(auth.ensureTokenAuthenticated, clients.update)
        .delete(auth.ensureTokenAuthenticated, clients.remove);

    app.route('/settings')
        .get(auth.ensureTokenAuthenticated, settings.getAll);

    app.route('/settings/:type')
        .delete(auth.ensureTokenAuthenticated, settings.revokeAcces);

    app.route('/settings/google/:calendarId')
        .put(auth.ensureTokenAuthenticated, settings.setCalendar);

    app.get('/auth/google',
        auth.ensureSessionAuthenticated,
        passport.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/calendar'
            ],
            accessType: 'offline'
        })
    );

    app.get('/auth/google/callback',
        auth.ensureSessionAuthenticated,
        authGoogle.callback
    );

};