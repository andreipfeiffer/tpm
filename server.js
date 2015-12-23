/*jshint globalstrict: true*/

(() => {    

    'use strict';

    const ENV = process.env.NODE_ENV || 'development';

    var express      = require('express'),
        logger       = require('morgan'),
        bodyParser   = require('body-parser'),
        cookieParser = require('cookie-parser'),
        session      = require('express-session'),
        passport     = require('passport'),
        config       = require('./config'),
        favicon      = require('serve-favicon'),
        app          = require('express')(),
        server       = require('http').Server( app ),
        io           = require('socket.io')( server ),
        redis        = require('redis'),
        redisStore   = require('connect-redis')(session),
        compression  = require('compression')/*,
        serveStatic  = require('serve-static')*/;

    function allowCrossDomain (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

        // intercept OPTIONS method
        if ('OPTIONS' === req.method) {
            res.send(200);
        } else {
            next();
        }
    }

    /*var function delay(req, res, next) {
        if ( req.url === '/projects' ) {
            setTimeout(function() {
                next();
            }, 2000);
        } else {
            next();
        }
    }*/

    // Application initialization
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

    // setup middleware
    if ('test' !== ENV) {
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
        secret: 'upsidedown-inseamna-Lia-si-Andrei',
        store: new redisStore({
            host  : 'localhost',
            port  : 6379,
            client: redis.createClient()
        }),
        saveUninitialized: true,
        resave: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    // app.use(express.csrf());

    app.use(compression());
    // temporary, because js files are pre-processed with Babel
    app.use('/public/js', express.static(__dirname + '/dist/dev/js'));
    app.use('/public', express.static(__dirname + '/public'));
    app.use('/dist', express.static(__dirname + '/dist'));
    app.use('/node_modules/systemjs', express.static(__dirname + '/node_modules/systemjs'));

    // app.use(serveStatic(__dirname + '/dist', { 'maxAge': '365 days', 'etag': true }));

    // app.use(delay);


    function start(port) {
        server.listen( port );
        console.log('Express server listening on port %d in %s mode', port, ENV);
    }

    module.exports = {
        start,
        app,
        knex,
        io
    };

    // verify database structure
    require('./server/modules/db').createDb(true).then(() => {

        // load routes
        require('./server/routes');

        require('./server/modules/status').init();
        require('./server/modules/utils').init();

        start(config.port);
    });

})();
