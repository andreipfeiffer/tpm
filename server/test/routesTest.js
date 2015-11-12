(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server     = require('../../server.js'),
        supertest  = require('supertest'),
        // request = supertest(server.app),
        agent      = supertest.agent(server.app),
        db         = require('../modules/db')( server.knex ),
        expect     = require('expect.js'),
        utils      = require('./_utils'),
        pack       = require('../../package.json');

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

        describe('Authorized routes without login', function() {
            it('should return index page', function(done) {
                agent
                    .get('/')
                    .end(function(err, res) {
                        expect( res.text ).to.have.string( pack.name );
                        expect( res.text ).to.have.string( pack.description );
                        expect( res.text ).to.have.string( pack.version );
                        expect( res.status ).to.equal(200);
                        done();
                    });
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

        describe('Authorized routes after login', function() {

            beforeEach(function(done) {
                utils.authenticateUser( agent ).then(function(res) {
                    utils.setAuthData( res.body );
                    done();
                });
            });

            it('should authorize GET:/clients', function(done) {
                agent
                    .get('/clients')
                    .set('authorization', utils.getAuthData().authToken)
                    .end(function(err, res) {
                        expect( res.status ).to.equal(200);
                        done();
                    });
            });
            it('should authorize GET:/clients/1', function(done) {
                agent
                    .get('/clients/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .end(function(err, res) {
                        expect( res.status ).to.equal(200);
                        done();
                    });
            });
            it('should authorize PUT:/clients/1', function(done) {
                agent
                    .put('/clients/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .send({ name: 'new name', description: 'desc' })
                    .end(function(err, res) {
                        expect( res.status ).to.equal(200);
                        done();
                    });
            });
            it('should authorize POST:/clients', function(done) {
                agent
                    .post('/clients')
                    .set('authorization', utils.getAuthData().authToken)
                    .send({ name: 'new client name' })
                    .end(function(err, res) {
                        expect( res.status ).to.equal(201);
                        done();
                    });
            });
            it('should authorize DELETE:/clients/1', function(done) {
                agent
                    .del('/clients/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .end(function(err, res) {
                        expect( res.status ).to.equal(204);
                        done();
                    });
            });
        });

    });
})();
