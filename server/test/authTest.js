(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server     = require('../../server.js'),
        supertest  = require('supertest'),
        // request = supertest(server.app),
        agent      = supertest.agent(server.app),
        db         = require('../modules/db'),
        expect     = require('expect.js'),
        utils      = require('./_utils');

    describe('Auth', function() {

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

        it('should not login the user with invalid username', function(done) {
            var body = {
                username: 'x',
                password: 'x'
            };

            agent
                .post('/login')
                .send(body)
                .end(function(err, res) {
                    expect( res.body ).to.have.property('error');
                    expect( res.status ).to.equal(401);
                    done();
                });
        });

        it('should not login the user with invalid password', function(done) {
            var body = {
                username: 'asd',
                password: 'x'
            };

            agent
                .post('/login')
                .send(body)
                .end(function(err, res) {
                    expect( res.body ).to.have.property('error');
                    expect( res.status ).to.equal(401);
                    done();
                });
        });

        it('should login the user with correct credentials', function(done) {
            utils.authenticateUser( agent ).then(function(res) {
                expect( res.body ).to.have.property('authUserId');
                expect( res.body ).to.have.property('authToken');
                expect( res.status ).to.equal(200);
                done();
            });
        });

        it('should logout the logged user', function(done) {
            utils.authenticateUser( agent ).then(function(res) {
                utils.setAuthData( res.body );
                return utils.logoutUser( agent );
            }).then(function() {
                agent
                    .get('/clients')
                    .set('authorization', utils.getAuthData().authToken)
                    .end(function(err, res) {
                        expect( res.status ).to.equal(401);
                        done();
                    });
            });
        });

    });
})();
