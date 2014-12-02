(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var app = require('../../server.js'),
        db = require('../modules/db')( app.knex ),
        clients = require('../modules/clients')( app.knex ),
        expect = require('expect.js');

    var user = { id: 1 };

    describe('Clients', function() {

        beforeEach(function(done) {
            db.createDb().then(function() {
                done();
            });
        });

        afterEach(function(done) {
            db.dropDb().then(function() {
                done();
            });
        });

        it('should add a new client', function(done) {
            var body = {
                    name: 'new unit test client'
                };

            clients.add(user, body).then(function(response) {
                expect( response.body ).to.have.property('name', body.name);
                expect( response.status ).to.equal(201);
                done();
            });
        });

        it('should not add a new client, without specified name', function(done) {
            clients.add(user, {}).then(function(response) {
                expect( response.body ).to.have.property('error');
                expect( response ).to.have.property('status', 503);
                done();
            });
        });

        it('should edit an existing client', function(done) {
            var body = {
                    name: 'edited name',
                    description: 'client description'
                };

            clients.update(user, 1, body).then(function(response) {
                expect( response.body ).to.be.ok();
                expect( response.status ).to.equal(200);
                done();
            });
        });

    });
})();
