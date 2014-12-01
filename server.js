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

/*var delay = function(req, res, next) {
    if ( req.url === '/projects' ) {
        setTimeout(function() {
            next();
        }, 2000);
    } else {
        next();
    }
};*/

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
app.set('views', __dirname + '/public');
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.locals.pretty = true; // render templates with identation

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
// app.use(delay);


// verify database structure
if ('development' === env) {
    require('./server/modules/db')( connection ).createDb();
}

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : config.mysql.host,
        user     : config.mysql.user,
        password : config.mysql.password,
        database : config.mysql.database
    }
});

// load routes
require('./server/routes')(app, knex);


function start(port) {
    app.listen(port);
    console.log('Express server listening on port %d in %s mode', port, env);
}

exports.start = start;
exports.app = app;
exports.connection = connection;

start(config.port);
