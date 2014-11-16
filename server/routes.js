module.exports = function(app, connection, passport) {

    'use strict';

    var auth  = require('./modules/auth')( connection ),
        authGoogle  = require('./modules/authGoogle')( connection ),
        clients = require('./modules/clients')( connection ),
        projects = require('./modules/projects')( connection ),
        settings = require('./modules/settings')( connection ),
        pack = require('../package.json');

    // setup passport auth (before routes, after express session)
    passport.use(auth.localStrategyAuth);
    passport.serializeUser(auth.serializeUser);
    passport.deserializeUser(auth.deserializeUser);

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