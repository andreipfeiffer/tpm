/*jshint globalstrict: true*/

'use strict';

var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    // @todo use knex (http://knexjs.org/#Builder-insert)
    mysql   = require('mysql'),
    passport = require('passport'),
    config  = require('./server/config');

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
var app = express(),
    env = process.env.NODE_ENV || 'development';

var connection = mysql.createConnection({
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password
});

// setup middleware based on ENV
if ('development' === env) {
    app.use(logger('dev'));
}

// setup common middleware
app.use(allowCrossDomain);
app.use(bodyParser.json());
// express cookieParser and session needed for passport
app.use(cookieParser());
app.use(session({
    secret: 'upsidedown-inseamna-Lia-si-Andrei' ,
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.csrf());
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));


// verify database structure
require('./server/modules/db')( connection );


var auth  = require('./server/modules/auth')( connection ),
    clients = require('./server/modules/clients')( connection ),
    projects = require('./server/modules/projects')( connection );

// setup passport auth (before routes, after express session)
passport.use(auth.localStrategyAuth);
passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

// @todo move routes reparately
app.post('/login', auth.login);
app.get('/logout', auth.logout);

// Projects routes
app.route('/projects')
    .get(auth.ensureAuthenticated, projects.getAll)
    .post(auth.ensureAuthenticated, projects.add);

app.route('/projects/:id')
    .get(auth.ensureAuthenticated, projects.getById)
    .put(auth.ensureAuthenticated, projects.update)
    .delete(auth.ensureAuthenticated, projects.remove);

// Clients routes
app.route('/clients')
    .get(auth.ensureAuthenticated, clients.getAll)
    .post(auth.ensureAuthenticated, clients.add);

app.route('/clients/:id')
    .get(auth.ensureAuthenticated, clients.getById)
    .put(auth.ensureAuthenticated, clients.update)
    .delete(auth.ensureAuthenticated, clients.remove);


function start(port) {
    app.listen(port);
    console.log('Express server listening on port %d in %s mode', port, env);
}

exports.start = start;
exports.app = app;

start(config.port);
