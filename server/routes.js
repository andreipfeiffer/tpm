module.exports = function(app, knex) {

    'use strict';

    var auth        = require('./modules/auth')( knex ),
        googleAuth  = require('./modules/googleAuth')( knex ),
        passport    = require('passport'),
        clients     = require('./modules/clients')( knex ),
        projects    = require('./modules/projects')( knex ),
        settings    = require('./modules/settings')( knex ),
        reports     = require('./modules/reports')( knex ),
        packageData = require('../package.json'),
        path        = require('path');

    function getResponse(res, result) {
        if ( !result.body ) {
            return res.status( result.status ).end();
        }
        return res.status( result.status ).send( result.body );
    }

    app.get('/', function(req, res) {
        if ('production' === process.env.NODE_ENV) {
            res.sendFile( path.join(__dirname, '../dist', '/index.html') );
        } else {
            res.render('index', packageData);
        }
    });

    app.post('/login', auth.login);
    app.get('/logout', auth.ensureSessionAuthenticated, auth.logout);

    app.route('/projects')
        .get(auth.ensureTokenAuthenticated, projects.getAll)
        .post(auth.ensureTokenAuthenticated, projects.add);

    app.route('/projects/:id')
        .get(auth.ensureTokenAuthenticated, projects.getById)
        .put(auth.ensureTokenAuthenticated, projects.update)
        .delete(auth.ensureTokenAuthenticated, projects.remove);

    app.route('/clients')
        .get(auth.ensureTokenAuthenticated, function(req, res) {
            clients.getAll(req.user).then(function(result) {
                return getResponse( res, result );
            });
        })
        .post(auth.ensureTokenAuthenticated, function(req, res) {
            clients.add(req.user, req.body).then(function(result) {
                return getResponse( res, result );
            });
        });

    app.route('/clients/:id')
        .get(auth.ensureTokenAuthenticated, function(req, res) {
            var id = parseInt( req.params.id );
            clients.getById(req.user, id).then(function(result) {
                return getResponse( res, result );
            });
        })
        .put(auth.ensureTokenAuthenticated, function(req, res) {
            var id = parseInt( req.params.id );
            clients.update(req.user, id, req.body).then(function(result) {
                return getResponse( res, result );
            });
        })
        .delete(auth.ensureTokenAuthenticated, function(req, res) {
            var id = parseInt( req.params.id );
            clients.remove(req.user, id).then(function(result) {
                return getResponse( res, result );
            });
        });

    app.route('/reports')
        .get(auth.ensureTokenAuthenticated, reports.getAll);


    app.route('/settings/google')
        .get(auth.ensureTokenAuthenticated, settings.getGoogle);

    app.route('/settings/user')
        .get(auth.ensureTokenAuthenticated, settings.getUser)
        .put(auth.ensureTokenAuthenticated, settings.setUser);

    app.route('/settings/google/:calendarId')
        .put(auth.ensureTokenAuthenticated, settings.setGoogle);

    app.route('/auth/google')
        .get(auth.ensureSessionAuthenticated, passport.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/calendar'
            ],
            accessType: 'offline'
        }))
        .delete(auth.ensureTokenAuthenticated, googleAuth.revokeAccess);

    app.get('/auth/google/callback',
        auth.ensureSessionAuthenticated,
        googleAuth.callback
    );

};