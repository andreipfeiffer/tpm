(function() {

    'use strict';

    process.env.NODE_ENV = 'test';

    var app = require('../../server.js'),
        db = require('../modules/db')( app.knex ),
        utils = require('../modules/utils')( app.knex ),
        expect = require('expect.js');

    xdescribe('Utils', function() {

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

        it('should log a new error', function(done) {
            utils.logError().then(function(data) {
                expect( data ).to.equal('');
                done();
            });
        });

    });
})();
