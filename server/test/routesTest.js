(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server = require('../../server.js'),
        supertest = require('supertest'),
        // request = supertest(server.app),
        agent = supertest.agent(server.app),
        db = require('../modules/db')( server.knex ),
        expect = require('expect.js');

    describe('Routes', function() {

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

        describe('Unauthorized routes', function() {
            it('should return unauthorized for GET:/clients', function(done) {
                agent
                    .get('/clients')
                    .end(function(err, res) {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
            it('should return unauthorized for GET:/clients/1', function(done) {
                agent
                    .get('/clients/1')
                    .end(function(err, res) {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
            it('should return unauthorized for PUT:/clients/1', function(done) {
                agent
                    .put('/clients/1')
                    .end(function(err, res) {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
            it('should return unauthorized for POST:/clients', function(done) {
                agent
                    .post('/clients')
                    .end(function(err, res) {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
            it('should return unauthorized for DELETE:/clients/1', function(done) {
                agent
                    .del('/clients/1')
                    .end(function(err, res) {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
        });

    });
})();
