(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server         = require('../../server.js'),
        knex           = server.knex,
        supertest      = require('supertest'),
        agent          = supertest.agent(server.app),
        db             = require('../modules/db'),
        projects       = require('../modules/projects'),
        googleCalendar = require('../modules/googleCalendar'),
        status         = require('../modules/status'),
        utils          = require('./_utils'),
        expect         = require('expect.js'),
        sinon          = require('sinon'),
        extend         = require('util')._extend;

    function getEmptyProject() {
        return {
            name          : 'new unit test project',
            status        : '',
            days          : null,
            priceEstimated: null,
            priceFinal    : null,
            dateAdded     : '',
            dateEstimated : '',
            description   : 'description',
            clientName    : null
        };
    }

    function getProjectWithData() {
        return extend(getEmptyProject(), {
            status        : 'finished',
            days          : 5,
            priceEstimated: 100,
            priceFinal    : 200,
        });
    }

    function getProjectChanged() {
        return extend(getEmptyProject(), {
            name          : 'changed unit test project',
            status        : 'paid',
            days          : 6,
            priceEstimated: 150,
            priceFinal    : 250,
            description   : 'changed description',
        });
    }

    describe('Projects', function() {

        beforeEach(function(done) {

            sinon.stub(status, 'updateIncome').returns();
            sinon.stub(status, 'updateProjects').returns();

            db.createDb().then(function() {
                return utils.authenticateUser( agent );
            }).then(function(res) {
                utils.setAuthData( res.body );
                done();
            });
        });

        afterEach(function(done) {

            status.updateIncome.restore();
            status.updateProjects.restore();

            db.dropDb().then(function() {
                done();
            });
        });

        it('should add a new project with full data', function(done) {
            var project = getProjectWithData();

            agent
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end(function(err, res) {
                    expect( res.body ).to.have.property('id');
                    expect( res.body ).to.have.property('name', project.name);
                    expect( res.body ).to.have.property('status', project.status);
                    expect( res.body ).to.have.property('priceEstimated', project.priceEstimated);
                    expect( res.body ).to.have.property('priceFinal', project.priceFinal);
                    expect( res.body ).to.have.property('days', project.days);
                    expect( res.body ).to.have.property('description', project.description);
                    expect( res.body ).to.have.property('isDeleted', 0);
                    expect( res.status ).to.equal(201);
                    done();
                });
        });

        it('should add a new project, if days & prices are null', function(done) {
            var project = getEmptyProject();

            agent
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end(function(err, res) {
                    expect( res.body ).to.have.property('id');
                    expect( res.body ).to.have.property('name', project.name);
                    expect( res.body ).to.have.property('days', 0);
                    expect( res.body ).to.have.property('priceEstimated', 0);
                    expect( res.body ).to.have.property('priceFinal', 0);
                    done();
                });
        });

        it('should add a new project, with a new client', function(done) {
            var project = getProjectWithData();
            project.clientName = 'new client per project';

            agent
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end(function(err, res) {
                    expect( res.body.idClient ).to.not.equal( 0 );
                    expect( res.body.clientName ).to.equal( project.clientName );
                    done();
                });
        });

        it('should add a new project, with an existing client', function(done) {
            var project = getProjectWithData();
            // this client name should exist on the user
            // has id: 2
            project.clientName = 'client Ion';

            agent
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end(function(err, res) {
                    expect( res.body.idClient ).to.equal( 2 );
                    expect( res.body.clientName ).to.equal( project.clientName );
                    done();
                });
        });

        it('should update an existing project', function(done) {
            var project = getProjectChanged();

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
                            expect( res.body ).to.have.property('status', project.status);
                            expect( res.body ).to.have.property('priceEstimated', project.priceEstimated);
                            expect( res.body ).to.have.property('priceFinal', project.priceFinal);
                            expect( res.body ).to.have.property('days', project.days);
                            expect( res.body ).to.have.property('description', project.description);
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

        // pretty shitty test
        // cannot use the existing methods
        // to add google events
        it('should remove all events', function(done) {
            var userId = utils.getUserId();

            knex('users').where({ id: userId }).update({ 'googleSelectedCalendar': 'calendarName' }).then(function() {
                return knex('projects').where({ idUser: userId }).update({ 'googleEventId': 'eventIdNumber' });
            }).then(function() {
                return projects.removeEvents( userId );
            }).then(function() {
                return knex('projects').select().where({ idUser: userId });
            }).then(function(data) {
                expect( data[0].googleEventId ).to.equal('');
                done();
            });
        });

        describe('Google Calendar integration', function() {

            xit('should add the calendar event, if status is active', function() {
            });

            xit('should not add the calendar event, if status is inactive', function() {
            });

            xit('should update the calendar event, if the event exists, and status is active', function() {
            });

            xit('should remove the calendar event, if the event exists, and status is inactive', function() {
            });

            xit('should add the calendar event, if the event does not exists, and status is active', function() {
            });

            xit('should not add the calendar event, if the event does not exists, and status is inactive', function() {
            });

        });

    });
})();
