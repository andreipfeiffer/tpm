(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server = require('../../server.js'),
        supertest = require('supertest'),
        // request = supertest(server.app),
        agent = supertest.agent(server.app),
        agent2 = supertest.agent(server.app),
        db = require('../modules/db')( server.knex ),
        expect = require('expect.js'),
        utils = require('./utils'),
        promise = require('node-promise'),
        deferred = promise.defer;

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
            var body = {
                username: 'asd',
                password: 'asdasd'
            };

            loginUser().then(function(res) {
                expect( res.body ).to.have.property('authUserId');
                expect( res.body ).to.have.property('authToken');
                expect( res.status ).to.equal(200);
                done();
            });
        });

        it('should logout the logged user', function(done) {
            utils.authenticateUser( agent ).then(function(res) {
                utils.setAuthData( res.body );
                return logoutUser();
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

        function loginUser() {
            var d = deferred();

            var body = {
                username: 'asd',
                password: 'asdasd'
            };

            agent2
                .post('/login')
                .send(body)
                .end(function(err, res) {
                    d.resolve(res);
                });

            return d.promise;
        }

        function logoutUser() {
            var d = deferred();

            agent
                .get('/logout')
                .end(function(err, res) {
                    d.resolve(res);
                });

            return d.promise;
        }

    });
})();
