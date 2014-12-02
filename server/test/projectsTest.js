(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server = require('../../server.js'),
        // httpMocks = require('node-mocks-http'),
        supertest = require('supertest'),
        // request = supertest(server.app),
        agent = supertest.agent(server.app),
        db = require('../modules/db')( server.knex );

    var promise = require('node-promise'),
        deferred = promise.defer;

    require('should');

    var loggedUser = {
        data: {
            id: 1
        },
        loginData: {
            username: 'asd',
            password: 'asdasd'
        },
        authData: {}
    };

    function authenticateUser() {
        var d = deferred();

        agent
            .post('/login')
            .send( loggedUser.loginData )
            .end(function(err, res) {
                if (err) {
                    d.reject(err);
                } else {
                    d.resolve(res);
                }
            });

        return d.promise;
    }

    describe('Projects', function() {

        beforeEach(function(done) {
            db.createDb().then(function() {
                done();
            });
        });

        beforeEach(function(done) {
            authenticateUser().then(function(res) {
                loggedUser.authData = res.body;
                done();
            });
        });

        afterEach(function(done) {
            db.dropDb().then(function() {
                done();
            });
        });

        it('should add a new project', function(done) {
            var body = {
                idClient: 1,
                name: 'new unit test project',
                status: '',
                days: 5,
                priceEstimated: 100,
                priceFinal: 200,
                dateAdded: '',
                dateEstimated: '',
                description: 'description',
                newClientName: ''
            };

            agent
                .post('/projects')
                .set('authorization', loggedUser.authData.authToken)
                .send(body)
                .end(function(err, res) {
                    res.body.should.have.property('id');
                    res.body.should.have.property('name', body.name);
                    res.body.should.have.property('isDeleted', 0);
                    res.should.have.property('status', 201);
                    done();
                });
        });

    });
})();
