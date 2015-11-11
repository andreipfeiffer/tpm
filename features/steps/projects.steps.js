var chai     = require('chai'),
    promised = require('chai-as-promised'),
    expect   = chai.expect;

chai.use( promised );

module.exports = function() {

    this.When(/^I type "([^"]*)" as the title$/, function (val, next) {
        element(by.model('project.name')).sendKeys( val );
        next();
    });

    this.Then(/^Project form should be disabled$/, function (next) {
        expect( element(by.css('button[type="submit"]')).isEnabled() ).to.eventually.equal( false );
        next();
    });

    this.Then(/^Project form should be enabled$/, function (next) {
        expect( element(by.css('button[type="submit"]')).isEnabled() ).to.eventually.equal( true );
        next();
    });

};
