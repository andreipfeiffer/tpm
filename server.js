/*jshint globalstrict: true*/

'use strict';

var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    config = require('./config'),
    favicon = require('serve-favicon'),
    compression = require('compression')/*,
    serveStatic = require('serve-static')*/;

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

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : config.mysql.host,
        user     : config.mysql.user,
        password : config.mysql.password,
        database : config.mysql.database
    }
});

app.set('etag', true);
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// setup middleware based on ENV
if ('test' !== env) {
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
    resave: false
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.csrf());

app.use(compression());
app.use(express.static(__dirname + '/public'));
app.use('/dist', express.static(__dirname + '/dist'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// app.use(serveStatic(__dirname + '/dist', { 'maxAge': '365 days', 'etag': true }));

// app.use(delay);


function start(port) {
    app.listen(port);
    console.log('Express server listening on port %d in %s mode', port, env);
}

exports.start = start;
exports.app   = app;
exports.knex  = knex;

// verify database structure
require('./server/modules/db')( knex ).createDb(true).then(function() {

    // load routes
    require('./server/routes')(app, knex);

    start(config.port);
});
