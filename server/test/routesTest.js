/*jshint globalstrict: true*/

'use strict';

process.env.NODE_ENV = 'test';

var app = require('../../server.js'),
    request = require('supertest'),
    config  = require('../../config/config'),
    db = require('../modules/db')( app.knex ),
    port = config.port,
    url  = 'http://localhost:' + port;

require('should');

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
                    done();
                    res.body.should.have.property('authUserId');
                    res.body.should.have.property('authToken');
                    res.should.have.property('status', 200);
                });
        });
    });
});