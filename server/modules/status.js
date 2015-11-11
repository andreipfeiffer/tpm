module.exports = (function() {

    'use strict';

    var server  = require('../../server'),
        knex    = server.knex,
        io      = server.io,
        promise = require('node-promise'),
        socket;

    function getTotalUsers() {
        var d = promise.defer();

        knex('users')
            .count('id as nr')
            .where({
                'isDeleted': '0'
            })
            .then(function( users ) {
                d.resolve( users[0].nr );
            });

        return d.promise;
    }

    function getTotalProjects() {
        var d = promise.defer();

        knex('projects')
            .count('id as nr')
            .where({
                'isDeleted': '0'
            })
            .then(function( projects ) {
                d.resolve( projects[0].nr );
            });

        return d.promise;
    }

    function getTotalIncome() {
        var d = promise.defer();

        knex('projects')
            .select('priceEstimated', 'priceFinal')
            .where({
                'isDeleted': '0',
                'status'   : 'paid'
            })
            .then(function( projects ) {
                var income = 0;

                projects.forEach(function(p) {
                    income += p.priceFinal || p.priceEstimated;
                });

                d.resolve( income );
            });

        return d.promise;
    }

    return {
        init: function() {
            var self = this;

            io.on('connection', function (_socket) {

                // store a reference to the socket object
                socket = _socket;

                socket.on('status.get', function (/*data*/) {
                    self.updateUsers();
                    self.updateProjects();
                    self.updateIncome();
                });

            });
        },

        updateUsers: function() {
            getTotalUsers().then(function(nr) {
                socket && socket.emit('status.data', { users: nr });
            });
        },

        updateProjects: function() {
            getTotalProjects().then(function(nr) {
                socket && socket.emit('status.data', { projects: nr });
            });
        },

        updateIncome: function() {
            getTotalIncome().then(function(income) {
                socket && socket.emit('status.data', { income: income });
            });
        }
    };

})();
