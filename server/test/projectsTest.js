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

    var getNewProject = function() {
        return {
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
    };

    describe('Projects', function() {

        beforeEach(function(done) {
            this.project = getNewProject();

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
            var project = this.project;

            agent
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end(function(err, res) {
                    expect( res.body ).to.have.property('id');
                    expect( res.body ).to.have.property('idClient', 1);
                    expect( res.body ).to.have.property('name', project.name);
                    expect( res.body ).to.have.property('isDeleted', 0);
                    expect( res.status ).to.equal(201);
                    done();
                });
        });

        it('should add a new project, with a new client', function(done) {
            var project = this.project;
            project.newClientName = 'new client per project';

            agent
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end(function(err, res) {
                    expect( res.body.idClient ).to.not.equal( project.idClient );
                    expect( res.status ).to.equal(201);
                    done();
                });
        });

        it('should update an existing project', function(done) {
            var project = this.project;

            agent
                .put('/projects/1')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end(function(err, res) {
                    expect( res.status ).to.equal(200);

                    agent
                        .get('/projects/1')
                        .set('authorization', utils.getAuthData().authToken)
                        .end(function(err, res) {
                            expect( res.body ).to.have.property('id', 1);
                            expect( res.body ).to.have.property('name', project.name);
                            done();
                        });
                });
        });

        it('should delete an existing project', function(done) {
            agent
                .delete('/projects/1')
                .set('authorization', utils.getAuthData().authToken)
                .end(function(err, res) {
                    expect( res.status ).to.equal(204);

                    agent
                        .get('/projects/1')
                        .set('authorization', utils.getAuthData().authToken)
                        .end(function(err, res) {
                            expect( res.status ).to.equal(404);
                            done();
                        });
                });
        });

        it('should get all projects', function(done) {
            agent
                .get('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .end(function(err, res) {
                    expect( res.body ).to.be.an('array');
                    expect( res.body ).to.have.length(3);
                    expect( res.status ).to.equal(200);
                    done();
                });
        });

    });
})();
