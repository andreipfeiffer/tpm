var express = require('express'),
	mysql   = require('mysql'),
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

app.configure(function () {
	app.use(allowCrossDomain);
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
	app.use(express.logger('dev'));
});

var db    = require('./controllers/db')( connection ),
	todos = require('./controllers/todos')( connection );

app.get('/todos', todos.getAll);
app.get('/todos/:id', todos.getById);
app.put('/todos/:id', todos.update);
// app.post('/todo', todos.add);
// app.delete('/todo/:id', todos.remove);

app.listen(config.web.port);
