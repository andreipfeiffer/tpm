var config = require('../config'),
	schema = require('../schema');

module.exports = function(connection) {

	'use strict';

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

			Object.keys(schema.structure).forEach(function(item){

				// Update the structure
				connection.query(schema.structure[item], function (err) {
					if (err) {
						throw err;
					}
					// @todo temporary: insert some fixtures, if database is empty
					connection.query('select * from `' + item + '`', function (err, docs) {
						if (err) {
							throw err;
						}
						if ( docs.length === 0 && schema.populate[item] ) {
							connection.query(schema.populate[item], function (err) {
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