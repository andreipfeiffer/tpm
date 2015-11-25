(() => {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server = require('../../server.js'),
        agent  = require('supertest').agent( server.app ),
        db     = require('../modules/db'),
        expect = require('expect.js'),
        utils  = require('./_utils'),
        pack   = require('../../package.json');

    describe('Routes', () => {

        beforeEach(done => db.createDb().then(() => done()));
        afterEach(done => db.dropDb().then(() => done()));

        describe('Authorized routes without login', () => {
            it('should return index page', done => {
                agent
                    .get('/')
                    .end((err, res) => {
                        expect( res.text ).to.have.string( pack.name );
                        expect( res.text ).to.have.string( pack.description );
                        expect( res.text ).to.have.string( pack.version );
                        expect( res.status ).to.equal(200);
                        done();
                    });
            });
        });

        describe('Unauthorized routes', () => {
            it('should return unauthorized for GET:/clients', done => {
                agent
                    .get('/clients')
                    .end((err, res) => {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
            it('should return unauthorized for GET:/clients/1', done => {
                agent
                    .get('/clients/1')
                    .end((err, res) => {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
            it('should return unauthorized for PUT:/clients/1', done => {
                agent
                    .put('/clients/1')
                    .end((err, res) => {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
            it('should return unauthorized for POST:/clients', done => {
                agent
                    .post('/clients')
                    .end((err, res) => {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
            it('should return unauthorized for DELETE:/clients/1', done => {
                agent
                    .del('/clients/1')
                    .end((err, res) => {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
        });

        describe('Authorized routes after login', () => {

            beforeEach(done => {
                utils.authenticateUser( agent ).then(res => {
                    utils.setAuthData( res.body );
                    done();
                });
            });

            it('should authorize GET:/clients', done => {
                agent
                    .get('/clients')
                    .set('authorization', utils.getAuthData().authToken)
                    .end((err, res) => {
                        expect( res.status ).to.equal(200);
                        done();
                    });
            });
            it('should authorize GET:/clients/1', done => {
                agent
                    .get('/clients/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .end((err, res) => {
                        expect( res.status ).to.equal(200);
                        done();
                    });
            });
            it('should authorize PUT:/clients/1', done => {
                agent
                    .put('/clients/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .send({ name: 'new name', description: 'desc' })
                    .end((err, res) => {
                        expect( res.status ).to.equal(200);
                        done();
                    });
            });
            it('should authorize POST:/clients', done => {
                agent
                    .post('/clients')
                    .set('authorization', utils.getAuthData().authToken)
                    .send({ name: 'new client name' })
                    .end((err, res) => {
                        expect( res.status ).to.equal(201);
                        done();
                    });
            });
            it('should authorize DELETE:/clients/1', done => {
                agent
                    .del('/clients/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .end((err, res) => {
                        expect( res.status ).to.equal(204);
                        done();
                    });
            });
        });

    });
})();
