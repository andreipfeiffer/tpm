module.exports = function(connection) {
	return {
		login: function(req, res) {
			console.log( req.body );
			// @todo perform a DB query
			if (
				req.body.username === 'asd' &&
				req.body.password === 'asd'
			) {
				return res.send({
					token: 'bfisdbfsdifasdfdbsfiah',
					id: '11'
				});
			}

			// @todo send an error response
			// res.statusCode = 401;
			res.send({
				error: 'wrong credentials'
			});
		},
	};
};