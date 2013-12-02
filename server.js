var express = require('express'),
    mysql   = require('mysql'),
    passport = require('passport'),
    config  = require('./config');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
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

// express - cookieParser and session needed for passport 
app.use(express.logger('dev'));
app.use(allowCrossDomain);
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'upsidedown-inseamna-Lia-si-Andrei' }));
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.csrf());
app.use(express.static(__dirname + '/public'));
app.use(app.router);


var db    = require('./modules/db')( connection ),
    todos = require('./modules/todos')( connection );
    auth  = require('./modules/auth')( connection );

// setup passport auth (before routes, after express session)
passport.use(auth.localStrategy);
passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

app.post('/login', auth.login);
app.get('/logout', 
    auth.logout
);

app.get('/todos', 
    auth.ensureAuthenticated,
    todos.getAll
);
app.get('/todos/:id',
    auth.ensureAuthenticated,
    todos.getById
);
app.put('/todos/:id', 
    auth.ensureAuthenticated,
    todos.update
);

// app.post('/todo', todos.add);
// app.delete('/todo/:id', todos.remove);

app.listen(config.web.port);
