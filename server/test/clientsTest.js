(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var app     = require('../../server.js'),
        db      = require('../modules/db'),
        clients = require('../modules/clients'),
        expect  = require('expect.js');

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

            clients.add(user, body).then(function(res) {
                expect( res.body ).to.have.property('name', body.name);
                expect( res.status ).to.equal(201);
                done();
            });
        });

        it('should not add a new client, without specified name', function(done) {
            clients.add(user, {}).then(function(res) {
                expect( res.body ).to.have.property('error');
                expect( res ).to.have.property('status', 503);
                done();
            });
        });

        it('should edit an existing client', function(done) {
            var body = {
                    name: 'edited name',
                    description: 'client description'
                };

            clients.update(user, 1, body).then(function(res) {
                expect( res.body ).to.be.ok();
                expect( res.status ).to.equal(200);

                clients.getById(user, 1).then(function(res) {
                    expect( res.body ).to.have.property('name', body.name);
                    expect( res.body ).to.have.property('description', body.description);
                    expect( res.status ).to.equal(200);
                    done();
                });
            });
        });

        it('should delete an existing client', function(done) {
            clients.remove(user, 1).then(function(res) {
                expect( res.status ).to.equal(204);

                clients.getById(user, 1).then(function(res) {
                    expect( res.status ).to.equal(404);
                    done();
                });
            });
        });

        it('should get all clients', function(done) {
            var expectedNr = 2;
            clients.getAll(user).then(function(res) {
                expect( res.body ).to.be.an('array');
                // there is an extra client added by default, the "no client" client
                expect( res.body ).to.have.length( expectedNr + 1 );
                expect( res.body[0].id ).to.equal( 0 );
                expect( res.status ).to.equal(200);
                done();
            });
        });

    });
})();
