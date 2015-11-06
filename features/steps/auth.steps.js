var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

module.exports = function() {

    this.Given(/^I am not logged in$/, function (next) {
        this.logout( next );
        // next();
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
        element(by.css('button[type="submit"]')).click().then(function() {
            next();
        });
    });

    this.Then(/^I should be redirected to "([^"]*)" page$/, function (page, next) {
        expect( browser.getLocationAbsUrl() ).to.eventually.equal('/' + page);
        next();
    });

    this.When(/^I enter incorrect credentials$/, function (next) {
        this.setCredentials('xxx', 'yyy');
        next();
    });

    this.Then(/^an error message should display$/, function (next) {
        expect( $('.fdb-error').isDisplayed() ).to.eventually.equal(true);
        next();
    });

};
