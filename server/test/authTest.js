(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server = require('../../server.js'),
        supertest = require('supertest'),
        // request = supertest(server.app),
        agent = supertest.agent(server.app),
        db = require('../modules/db')( server.knex ),
        expect = require('expect.js');

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

        it('should not login the user with invalid credentials', function(done) {
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

        it('should login the user with correct credentials', function(done) {
            var body = {
                username: 'asd',
                password: 'asdasd'
            };

            agent
                .post('/login')
                .send(body)
                .end(function(err, res) {
                    expect( res.body ).to.have.property('authUserId');
                    expect( res.body ).to.have.property('authToken');
                    expect( res.status ).to.equal(200);
                    done();
                });
        });

    });
})();
