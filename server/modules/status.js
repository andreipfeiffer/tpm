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
            io.on('connection', function (_socket) {

                // store a reference to the socket object
                socket = _socket;

                socket.on('status.get', function (data) {
                    var nrUsers    = 0,
                        nrProjects = 0,
                        income     = 0;

                    getTotalUsers().then(function(nr) {
                        nrUsers = nr;
                        return getTotalProjects();
                    }).then(function(nr) {
                        nrProjects = nr;
                        return getTotalIncome();
                    }).then(function(income) {
                        socket.emit('status.data', { users: nrUsers, projects: nrProjects, income: income });
                    });

                });

            });
        },

        updateProjects: function() {
            getTotalProjects().then(function(nr) {
                socket.emit('status.data', { projects: nr });
            });
        },

        updateIncome: function() {
            getTotalIncome().then(function(income) {
                socket.emit('status.data', { income: income });
            });
        }
    };

})();
