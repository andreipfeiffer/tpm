var chai     = require('chai'),
    promised = require('chai-as-promised'),
    expect   = chai.expect;

chai.use( promised );

module.exports = function() {

    this.Given(/^I am on the "([^"]*)" page$/, function (page, next) {
        browser.get('/#/' + page);
        next();
    });

    this.When(/^I navigate to "([^"]*)" page$/, function (page, next) {
        browser.get('/#/' + page);
        next();
    });

    this.Then(/^I should be redirected to "([^"]*)" page$/, function (page, next) {
        browser.getLocationAbsUrl().then(function(url) {
            expect( url ).to.equal('/' + page);
            next();
        });
    });

    this.Then(/^an error message should display$/, function (next) {
        expect( $('.fdb-error').isDisplayed() ).to.eventually.equal( true );
        next();
    });

    this.Then(/^the message should read "([^"]*)"$/, function (message, next) {
        $('.fdb').getText().then(function(text) {
            expect( text ).to.equal( message );
            next();
        });
    });

    this.Then(/^The menu bar should not be visible$/, function (next) {
        element(by.css('#navbar')).isPresent().then(function(exists) {
            expect( exists ).to.equal( false );
            next();
        });
    });

};
