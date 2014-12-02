(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server = require('../../server.js'),
        supertest = require('supertest'),
        // request = supertest(server.app),
        agent = supertest.agent(server.app),
        db = require('../modules/db')( server.knex ),
        utils = require('./utils'),
        expect = require('expect.js');

    describe('Projects', function() {

        beforeEach(function(done) {
            db.createDb().then(function() {
                return utils.authenticateUser( agent );
            }).then(function(res) {
                utils.setAuthData( res.body );
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
                .set('authorization', utils.getAuthData().authToken)
                .send(body)
                .end(function(err, res) {
                    expect( res.body ).to.have.property('id');
                    expect( res.body ).to.have.property('name', body.name);
                    expect( res.body ).to.have.property('isDeleted', 0);
                    expect( res ).to.have.property('status', 201);
                    done();
                });
        });

    });
})();
