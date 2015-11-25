module.exports = (() => {

    'use strict';

    var server  = require('../../server'),
        knex    = server.knex,
        io      = server.io,
        socket;

    function getTotalUsers() {
        var d = Promise.defer();

        knex('users')
            .count('id as nr')
            .where({
                'isDeleted': '0'
            })
            .then(users => d.resolve( users[0].nr ));

        return d.promise;
    }

    function getTotalProjects() {
        var d = Promise.defer();

        knex('projects')
            .count('id as nr')
            .where({
                'isDeleted': '0'
            })
            .then(projects => d.resolve( projects[0].nr ));

        return d.promise;
    }

    function getTotalIncome() {
        var d = Promise.defer();

        knex('projects')
            .select('priceEstimated', 'priceFinal')
            .where({
                'isDeleted': '0',
                'status'   : 'paid'
            })
            .then(projects => {
                var income = 0;
                projects.forEach(p => income += p.priceFinal || p.priceEstimated);
                d.resolve( income );
            });

        return d.promise;
    }

    return {
        init() {
            io.on('connection', _socket => {
                // store a reference to the socket object
                socket = _socket;

                socket.on('status.get', (/*data*/) => {
                    this.updateUsers();
                    this.updateProjects();
                    this.updateIncome();
                });

            });
        },

        updateUsers() {
            getTotalUsers().then(nr => {
                socket && socket.emit('status.data', { users: nr });
            });
        },

        updateProjects() {
            getTotalProjects().then(nr => {
                socket && socket.emit('status.data', { projects: nr });
            });
        },

        updateIncome() {
            getTotalIncome().then(income => {
                socket && socket.emit('status.data', { income: income });
            });
        }
    };

})();
