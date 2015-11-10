var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

module.exports = function() {

    this.Given(/^I am not logged in$/, function (next) {
        this.logout( next );
        // next();
    });

    this.Given(/^I am logged in$/, function (next) {
        var self = this;
        this.logout(function() {
            browser.get('/#/login');
            self.setCredentials('asd', 'asdasd');
            self.clickLogin( next );
        });
    });

    this.Given(/^I am on the "([^"]*)" page$/, function (page, next) {
        browser.get('/#/' + page);
        next();
    });

    this.When(/^I enter correct credentials$/, function (next) {
        this.setCredentials('asd', 'asdasd');
        next();
    });

    this.When(/^I submit the login form$/, function (next) {
        this.clickLogin( next );
    });

    this.When(/^I logout$/, function (next) {
        this.logout( next );
    });

    this.When(/^I enter incorrect credentials$/, function (next) {
        this.setCredentials('xxx', 'yyy');
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

};
