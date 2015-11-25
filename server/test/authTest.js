(() => {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server  = require('../../server.js'),
        request = require('supertest').agent( server.app ),
        db      = require('../modules/db'),
        expect  = require('expect.js'),
        utils   = require('./_utils');

    describe('Auth', () => {

        beforeEach(done => db.createDb().then(() => done()));
        afterEach(done => db.dropDb().then(() => done()));

        it('should not login the user with invalid username', done => {
            var body = {
                username: 'x',
                password: 'x'
            };

            request
                .post('/login')
                .send(body)
                .end((err, res) => {
                    expect( res.body ).to.have.property('error');
                    expect( res.status ).to.equal(401);
                    done();
                });
        });

        it('should not login the user with invalid password', done => {
            var body = {
                username: 'asd',
                password: 'x'
            };

            request
                .post('/login')
                .send(body)
                .end((err, res) => {
                    expect( res.body ).to.have.property('error');
                    expect( res.status ).to.equal(401);
                    done();
                });
        });

        it('should login the user with correct credentials', done => {
            utils.authenticateUser( request ).then(res => {
                expect( res.body ).to.have.property('authUserId');
                expect( res.body ).to.have.property('authToken');
                expect( res.status ).to.equal(200);
                done();
            });
        });

        it('should logout the logged user', done => {
            utils
                .authenticateUser( request )
                .then(res => {
                    utils.setAuthData( res.body );
                    return utils.logoutUser( request );
                })
                .then(() => {
                    request
                        .get('/clients')
                        .set('authorization', utils.getAuthData().authToken)
                        .end((err, res) => {
                            expect( res.status ).to.equal(401);
                            done();
                        });
                });
        });

    });
})();
