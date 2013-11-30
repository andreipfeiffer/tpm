var config = require('../config');

module.exports = function(connection) {

	// Create database, if it doesn't exist
	connection.query('CREATE DATABASE IF NOT EXISTS ' + config.mysql.database, function (err) {
		if (err) {
			throw err;
		}
		// Select database
		connection.query('USE ' + config.mysql.database, function (err) {
			if (err) {
				throw err;
			}
			// Update the structure
			connection.query(config.mysql.structure, function (err) {
				if (err) {
					throw err;
				}
				// @todo temporary: insert some fixtures, if database is empty
				connection.query('select * from `todos`', function (err, docs) {
					if (err) {
						throw err;
					}
					if ( docs.length === 0 ) {
						connection.query(config.mysql.populate, function (err) {
							if (err) {
								throw err;
							}
						});
					}
				});
			});
		});
	});

};