(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var app = require('../../server.js'),
        httpMocks = require('node-mocks-http'),
        db = require('../modules/db')( app.knex ),
        clients = require('../modules/clients')( app.knex );

    require('should');

    describe('Clients', function() {

        beforeEach(function(done) {
            db.createDb().then(function() {
                done();
            });
        });

        beforeEach(function() {
            this.res = httpMocks.createResponse();
        });

        afterEach(function(done) {
            db.dropDb().then(function() {
                done();
            });
        });

        describe('Add', function() {
            it('should add a new client', function(done) {
                var req = httpMocks.createRequest({
                    body: {
                        // name: 'new unit test client'
                    }
                });

                req.user = { id: 1 };

                clients.add(req, this.res).then(function(response) {
                    response.data.should.have.property('error');
                    response.should.have.property('status', 503);
                    done();
                });
            });
        });

        describe('Add', function() {
            it('should add a new client', function(done) {
                var name = 'new unit test client',
                    req = httpMocks.createRequest({
                    body: {
                        name: name
                    }
                });

                req.user = { id: 1 };

                clients.add(req, this.res).then(function(response) {
                    response.data.should.have.property('name', name);
                    response.should.have.property('status', 201);
                    done();
                });
            });
        });

    });
})();
