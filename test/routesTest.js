var app = require("../server.js"),
    should = require("should"),
    assert = require('assert'),
    request = require('supertest');

var port = 3030,
    url  = 'http://localhost:' + port;

app.start(port);

/*
 *  @todo break into several test files
 */

describe('Routes', function() {

    describe('Unauthorized', function() {
        it('should return unauthorized', function(done) {
            request(url)
                .get('/todos')
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                })
        });
        it('should return unauthorized', function(done) {
            request(url)
                .get('/todos/1')
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                })
        });
        it('should return unauthorized', function(done) {
            request(url)
                .put('/todos/1')
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                })
        });
        it('should return unauthorized', function(done) {
            request(url)
                .post('/todos')
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                })
        });
        it('should return unauthorized', function(done) {
            request(url)
                .del('/todos/1')
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                })
        });
    });


    describe('Auth', function() {
        it('should not login the user with invalid credentials', function(done) {
            var body = {
                username: 'x',
                password: 'x'
            };

            request(url)
                .post('/login')
                .send(body)
                .end(function(err, res) {
                    res.body.should.have.property('error');
                    done();
                })
        });
        it('should login the user with correct credentials', function(done) {
            var body = {
                username: 'asd@asd.asd',
                password: 'asdasd'
            };

            request(url)
                .post('/login')
                .send(body)
                .end(function(err, res) {
                    res.body.should.have.property('authUserId');
                    res.body.should.have.property('authToken');
                    res.should.have.status(200);
                    done();
                })
        });
    });
});