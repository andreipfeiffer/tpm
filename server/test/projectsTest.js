(() => {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server         = require('../../server.js'),
        knex           = server.knex,
        request        = require('supertest').agent( server.app ),
        db             = require('../modules/db'),
        projects       = require('../modules/projects'),
        googleCalendar = require('../modules/googleCalendar'),
        status         = require('../modules/status'),
        utils          = require('./_utils'),
        expect         = require('expect.js'),
        sinon          = require('sinon');

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
        return Object.assign(getEmptyProject(), {
            status        : 'finished',
            days          : 5,
            priceEstimated: 100,
            priceFinal    : 200,
        });
    }

    function getProjectChanged() {
        return Object.assign(getEmptyProject(), {
            name          : 'changed unit test project',
            status        : 'paid',
            days          : 6,
            priceEstimated: 150,
            priceFinal    : 250,
            description   : 'changed description',
        });
    }

    describe('Projects', () => {

        beforeEach(done => {

            sinon.stub(status, 'updateIncome').returns();
            sinon.stub(status, 'updateProjects').returns();

            db.createDb()
                .then(() => utils.authenticateUser( request ))
                .then(res => {
                    utils.setAuthData( res.body );
                    done();
                });
        });

        afterEach(done => {

            status.updateIncome.restore();
            status.updateProjects.restore();

            db.dropDb().then(() => done());
        });

        it('should add a new project with full data', done => {
            var project = getProjectWithData();

            request
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end((err, res) => {
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

        it('should add a new project, if days & prices are null', done => {
            var project = getEmptyProject();

            request
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end((err, res) => {
                    expect( res.body ).to.have.property('id');
                    expect( res.body ).to.have.property('name', project.name);
                    expect( res.body ).to.have.property('days', 0);
                    expect( res.body ).to.have.property('priceEstimated', 0);
                    expect( res.body ).to.have.property('priceFinal', 0);
                    done();
                });
        });

        it('should add a new project, with a new client', done => {
            var project = getProjectWithData();
            project.clientName = 'new client per project';

            request
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end((err, res) => {
                    expect( res.body.idClient ).to.not.equal( 0 );
                    expect( res.body.clientName ).to.equal( project.clientName );
                    done();
                });
        });

        it('should add a new project, with an existing client', done => {
            var project = getProjectWithData();
            // this client name should exist on the user
            // has id: 2
            project.clientName = 'client Ion';

            request
                .post('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end((err, res) => {
                    expect( res.body.idClient ).to.equal( 2 );
                    expect( res.body.clientName ).to.equal( project.clientName );
                    done();
                });
        });

        it('should update an existing project', done => {
            var project = getProjectChanged();

            request
                .put('/projects/1')
                .set('authorization', utils.getAuthData().authToken)
                .send( project )
                .end((err, res) => {
                    expect( res.status ).to.equal(200);

                    request
                        .get('/projects/1')
                        .set('authorization', utils.getAuthData().authToken)
                        .end((err, res) => {
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

        it('should delete an existing project', done => {
            request
                .delete('/projects/1')
                .set('authorization', utils.getAuthData().authToken)
                .end((err, res) => {
                    expect( res.status ).to.equal(204);

                    request
                        .get('/projects/1')
                        .set('authorization', utils.getAuthData().authToken)
                        .end((err, res) => {
                            expect( res.status ).to.equal(404);
                            done();
                        });
                });
        });

        it('should get all non-archived projects', done => {
            request
                .get('/projects')
                .set('authorization', utils.getAuthData().authToken)
                .end((err, res) => {
                    expect( res.body ).to.be.an('array');
                    expect( res.body ).to.have.length(2);
                    expect( res.status ).to.equal(200);
                    done();
                });
        });

        // pretty shitty test
        // cannot use the existing methods
        // to add google events
        it('should remove all events', done => {
            var userId = utils.getUserId();

            knex('users')
                .where({ id: userId })
                .update({ 'googleSelectedCalendar': 'calendarName' })
                .then(() => knex('projects').where({ idUser: userId }).update({ 'googleEventId': 'eventIdNumber' }))
                .then(() => projects.removeEvents( userId ))
                .then(() => knex('projects').select().where({ idUser: userId }))
                .then(data => {
                    expect( data[0].googleEventId ).to.equal('');
                    done();
                });
        });

        describe('Google Calendar integration', () => {

            beforeEach(() => {
                this.stubEvent = sinon.stub( googleCalendar, 'doesEventExists' );
            });

            afterEach(() => {
                this.stubEvent.restore();
            });

            xit('should add the calendar event, if status is active', () => {
            });

            xit('should not add the calendar event, if status is inactive', () => {
            });

            it('should update the calendar event, if the event exists, and status is active', done => {
                var project    = getProjectChanged();
                project.status = 'started';

                this.stubEvent.returns( true );
                var spy = sinon.spy( googleCalendar, 'updateEvent' );

                request
                    .put('/projects/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .send( project )
                    .end((/*err, res*/) => {
                        expect( spy.calledOnce ).to.equal( true );

                        spy.restore();
                        done();
                    });
            });

            it('should remove the calendar event, if the event exists, and status is inactive', done => {
                var project    = getProjectChanged();
                project.status = 'paid';

                this.stubEvent.returns( true );
                var spy = sinon.spy( googleCalendar, 'deleteEvent' );

                request
                    .put('/projects/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .send( project )
                    .end((/*err, res*/) => {
                        expect( spy.calledOnce ).to.equal( true );

                        spy.restore();
                        done();
                    });
            });

            it('should add the calendar event, if the event does not exists, and status is active', done => {
                var project    = getProjectChanged();
                project.status = 'started';

                this.stubEvent.returns( false );
                var spy = sinon.spy( googleCalendar, 'setEventId' );

                request
                    .put('/projects/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .send( project )
                    .end((/*err, res*/) => {
                        expect( spy.calledOnce ).to.equal( true );

                        spy.restore();
                        done();
                    });
            });

            it('should not add the calendar event, if the event does not exists, and status is inactive', done => {
                var project    = getProjectChanged();
                project.status = 'paid';

                this.stubEvent.returns( false );
                var spy = sinon.spy( googleCalendar, 'setEventId' );

                request
                    .put('/projects/1')
                    .set('authorization', utils.getAuthData().authToken)
                    .send( project )
                    .end((/*err, res*/) => {
                        expect( spy.calledOnce ).to.equal( false );

                        spy.restore();
                        done();
                    });
            });

        });

    });
})();
