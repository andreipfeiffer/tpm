(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var app = require('../../server.js'),
        request = require('supertest'),
        config  = require('../../config/config'),
        db = require('../modules/db')( app.knex ),
        port = config.port,
        url  = 'http://localhost:' + port,
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

            request(url)
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

            request(url)
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
