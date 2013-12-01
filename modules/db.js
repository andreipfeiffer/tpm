var config = require('../config');

module.exports = function(connection) {

	// Create database, if it doesn't exist
	connection.query('CREATE DATABASE IF NOT EXISTS ' + config.mysql.database + ' DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci', function (err) {
		if (err) {
			throw err;
		}
		// Select database
		connection.query('USE ' + config.mysql.database, function (err) {
			if (err) {
				throw err;
			}

			Object.keys(config.mysql.structure).forEach(function(item){
				// Update the structure
				connection.query(config.mysql.structure[item], function (err) {
					if (err) {
						throw err;
					}
					// @todo temporary: insert some fixtures, if database is empty
					connection.query('select * from `' + item + '`', function (err, docs) {
						if (err) {
							throw err;
						}
						if ( docs.length === 0 ) {
							connection.query(config.mysql.populate[item], function (err) {
								if (err) {
									throw err;
								}
							});
						}
					});
				});
			});

		});
	});

};