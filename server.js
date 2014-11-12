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
    config  = require('./server/config'),
    pack = require('./package.json');

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
require('./server/modules/db')( connection );


var auth  = require('./server/modules/auth')( connection ),
    clients = require('./server/modules/clients')( connection ),
    projects = require('./server/modules/projects')( connection );

// setup passport auth (before routes, after express session)
passport.use(auth.localStrategyAuth);



var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');
var oauth2Client = new OAuth2();

passport.use('google',
    new OAuth2Strategy({
        authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
        tokenURL: 'https://accounts.google.com/o/oauth2/token',
        clientID: '884230170474-hnregfn60k074bobre6qje7vhgr9ahe5.apps.googleusercontent.com',
        clientSecret: 'e3KrQBubKpeNHidGFCIp9Y0Y',
        callbackURL: '/oauth2callback',
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        console.log(req.headers.authorization);
        auth.setGoogleOAuthToken(req.sessionID, accessToken, function(err, user) {
            oauth2Client.setCredentials({
                'access_token': accessToken
            });
            google.options({ auth: oauth2Client });
            done(err, user);
        });
    }
));

passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

app.get('/auth/google',
    auth.ensureSessionAuthenticated,
    passport.authenticate('google', { scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar']
    })
);
app.get('/oauth2callback',
    auth.ensureSessionAuthenticated,
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
);
app.get('/cal',
    auth.ensureSessionAuthenticated,
    function(req, res) {
        calendar.calendarList.list({}, function(err, response) {
            if (err) {
                console.log(err);
                res.send(err);
            }
            console.log(response);
            res.send(response);
        });
    }
);



// Projects routes
// @todo move routes reparately

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

// Clients routes
app.route('/clients')
    .get(auth.ensureTokenAuthenticated, clients.getAll)
    .post(auth.ensureTokenAuthenticated, clients.add);

app.route('/clients/:id')
    .get(auth.ensureTokenAuthenticated, clients.getById)
    .put(auth.ensureTokenAuthenticated, clients.update)
    .delete(auth.ensureTokenAuthenticated, clients.remove);


function start(port) {
    app.listen(port);
    console.log('Express server listening on port %d in %s mode', port, env);
}

exports.start = start;
exports.app = app;

start(config.port);
