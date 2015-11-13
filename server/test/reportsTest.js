(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server         = require('../../server.js'),
        knex           = server.knex,
        supertest      = require('supertest'),
        agent          = supertest.agent(server.app),
        db             = require('../modules/db'),
        reports        = require('../modules/reports'),
        utils          = require('./_utils'),
        expect         = require('expect.js');

    describe('Reports', function() {

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

        // ok, this tests only 1 complex query
        // based on fixtures on projects & projects_status_log tables
        it('should return the report', function(done) {
            agent
                .get('/reports')
                .set('authorization', utils.getAuthData().authToken)
                .end(function(err, res) {

                    // return only projects "finished" or "paid"
                    expect( res.body ).to.be.an('array');
                    expect( res.body ).to.have.length( 2 );

                    // first result
                    expect( res.body[0] ).to.have.property('status', 'paid');
                    expect( res.body[0] ).to.have.property('month', '2015-1');
                    expect( res.body[0] ).to.have.property('idClient', 0);
                    expect( res.body[0] ).to.have.property('clientName', null);

                    // second result
                    expect( res.body[1] ).to.have.property('status', 'finished');
                    expect( res.body[1] ).to.have.property('month', '2014-11');
                    expect( res.body[1] ).to.have.property('idClient', 2);
                    expect( res.body[1] ).to.have.property('clientName', 'client Ion');

                    done();
                });
        });

    });
})();
