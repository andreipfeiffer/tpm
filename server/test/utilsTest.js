(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var server = require('../../server.js'),
        app    = server.app,
        db     = require('../modules/db'),
        utils  = require('../modules/utils'),
        // expect = require('expect.js'),
        sinon  = require('sinon');

    function getLog() {
        return {
            idUser: 3,
            source: 'utilsTest',
            data  : { someData: 'test' },
            error : { error: 'error object' }
        };        
    }

    describe('Utils', function() {

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

        it('should emit en error event', function() {

            var log = getLog();
            var mock = sinon.mock( utils );

            mock
                .expects('logError')
                    .once()
                    .withExactArgs( log );

            app.emit('logError', log);

            mock.verify();
            mock.restore();
        });

        it('should log a new error', function(done) {

            var log  = getLog(),
                mock = sinon.mock( console );

            mock.expects('trace').once();

            utils.logError( log ).then(function() {
                mock.verify();
                mock.restore();
                done();
            });
        });

    });
})();
