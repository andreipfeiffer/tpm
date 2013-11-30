module.exports = function(connection) {
	return {
		getAll: function(req, res) {
			var userLogged = req.user;
			connection.query('select * from `todos` where `id_user`="' + userLogged.id + '"', function(err, docs) {
				res.send({'todos': docs});
			});
		},


		getById: function(req, res) {
			var id = req.params.id,
				userLogged = req.user;

			if( isNaN(parseInt( req.params.id, 10 )) ) {
				return res.send('TypeError: a number is required');
			}

			console.log('Retrieving todo: ' + id);
			db.collection('todos', function(err, collection) {
				collection.findOne({'id': parseInt(id, 10)}, function(err, item) {

					if (err) {
						res.statusCode = 404;
						return res.send('Error: something went wrong');
					}

					if (!item) {
						res.statusCode = 404;
						return res.send('Error 404: todo with id="' + id + '" was not found');
					}

					res.send(item);
				});
			});

		},

		update: function(req, res) {
			var id = parseInt( req.params.id, 10 );

			// @todo handle all update variations
			connection.query('update `todos` set `isCompleted`=' + req.body.todo.isCompleted + ' where `id`="' + id + '"', function(err) {
				res.send(true);
			});
		},

		/*exports.add = function(req, res) {
			if(!req.body.hasOwnProperty('author') || 
				 !req.body.hasOwnProperty('text')) {
				res.statusCode = 400;
				return res.send('Error 400: Post syntax incorrect.');
			}

			var newQuote = {
				author : req.body.author,
				text : req.body.text
			};

			todos.push(newQuote);
			res.json(true);
		};

		exports.remove = function(req, res) {
			if(todos.length <= req.params.id) {
				res.statusCode = 404;
				return res.send('Error 404: No quote found');
			}

			todos.splice(req.params.id, 1);
			res.json(true);
		};*/
	};

};