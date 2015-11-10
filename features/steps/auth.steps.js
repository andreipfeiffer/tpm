var chai     = require('chai'),
    // promised = require('chai-as-promised'),
    expect   = chai.expect;

// chai.use( promised );

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

};
