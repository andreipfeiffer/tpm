/*jshint globalstrict: true*/

'use strict';

var express = require('express'),
    // @todo use knex (http://knexjs.org/#Builder-insert)
    mysql   = require('mysql'),
    passport = require('passport'),
    config  = require('./config');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        res.send(200);
    } else {
        next();
    }
};

// Application initialization
var app = express();

var connection = mysql.createConnection({
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password
});

app.use(express.logger('dev'));
app.use(allowCrossDomain);
app.use(express.bodyParser());
// express cookieParser and session needed for passport 
app.use(express.cookieParser());
app.use(express.session({ secret: 'upsidedown-inseamna-Lia-si-Andrei' }));
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.csrf());
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(app.router);


// verify database structure
require('./modules/db')( connection );


var auth  = require('./modules/auth')( connection ),
    clients = require('./modules/clients')( connection ),
    projects = require('./modules/projects')( connection );

// setup passport auth (before routes, after express session)
passport.use(auth.localStrategyAuth);
passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

// @todo move routes reparately
app.post('/login', auth.login);
app.get('/logout', auth.logout);

// Projects routes
app.get('/projects', 
    auth.ensureAuthenticated,
    projects.getAll
);
app.get('/projects/:id',
    auth.ensureAuthenticated,
    projects.getById
);
app.put('/projects/:id', 
    auth.ensureAuthenticated,
    projects.update
);
app.post('/projects',
    auth.ensureAuthenticated,
    projects.add
);
app.delete('/projects/:id', 
    auth.ensureAuthenticated,
    projects.remove
);

// Clients routes
app.get('/clients', 
    auth.ensureAuthenticated,
    clients.getAll
);
app.get('/clients/:id',
    auth.ensureAuthenticated,
    clients.getById
);
app.put('/clients/:id', 
    auth.ensureAuthenticated,
    clients.update
);
app.post('/clients',
    auth.ensureAuthenticated,
    clients.add
);
app.delete('/clients/:id', 
    auth.ensureAuthenticated,
    clients.remove
);

function start(port) {
    app.listen(port);
    console.log('Express server listening on port %d in %s mode', port, app.settings.env);
}

exports.start = start;
exports.app = app;

start(config.web.port);
