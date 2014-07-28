/*jshint globalstrict: true*/

'use strict';

require('should');

var app = require('../../server.js'),
    request = require('supertest'),
    port = 3030,
    url  = 'http://localhost:' + port;

app.start(port);

/*
 *  @todo break into several test files
 */

describe('Routes', function() {

    describe('Unauthorized', function() {
        it('should return unauthorized', function(done) {
            request(url)
                .get('/projects')
                .end(function(err, res) {
                    res.should.have.property('status', 401);
                    done();
                });
        });
        it('should return unauthorized', function(done) {
            request(url)
                .get('/projects/1')
                .end(function(err, res) {
                    res.should.have.property('status', 401);
                    done();
                });
        });
        it('should return unauthorized', function(done) {
            request(url)
                .put('/projects/1')
                .end(function(err, res) {
                    res.should.have.property('status', 401);
                    done();
                });
        });
        it('should return unauthorized', function(done) {
            request(url)
                .post('/projects')
                .end(function(err, res) {
                    res.should.have.property('status', 401);
                    done();
                });
        });
        it('should return unauthorized', function(done) {
            request(url)
                .del('/projects/1')
                .end(function(err, res) {
                    res.should.have.property('status', 401);
                    done();
                });
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
                    res.body.should.have.property('authUserId');
                    res.body.should.have.property('authToken');
                    res.should.have.property('status', 200);
                    done();
                });
        });
    });
});