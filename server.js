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
    projects = require('./server/modules/projects')( connection ),
    settings = require('./server/modules/settings')( connection );

// setup passport auth (before routes, after express session)
passport.use(auth.localStrategyAuth);



var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');
var oauth2Client = new OAuth2();

google.options({ auth: oauth2Client });

passport.use('google',
    new GoogleStrategy({
        clientID: '884230170474-ndnan3kql7s5dd7rg7o5botd92d2fitl.apps.googleusercontent.com',
        clientSecret: '7ulfAHdrB6NGPuplrUGh8eYq',
        callbackURL: '/auth/google/callback',
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        auth.storeGoogleOAuthToken(req.sessionID, accessToken, function(err, user) {
            oauth2Client.setCredentials({
                'access_token': accessToken
            });
            done(err, user);
        });
    }
));

passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

app.get('/auth/google',
    auth.ensureSessionAuthenticated,
    passport.authenticate('google', { scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/calendar'
    ]})
);
app.get('/auth/google/callback',
    auth.ensureSessionAuthenticated,
    function(req, res, next) {
        passport.authenticate('google', function(err, user/*, info*/) {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/#settings');
            });
        })(req, res, next);
    }
);
app.get('/cal',
    auth.ensureSessionAuthenticated,
    function(req, res) {
        calendar.calendarList.list({}, function(err, response) {
            if (err) {
                res.status(err.code).send({ error: err.message });
                return;
            }
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


function start(port) {
    app.listen(port);
    console.log('Express server listening on port %d in %s mode', port, env);
}

exports.start = start;
exports.app = app;

start(config.port);
