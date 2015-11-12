module.exports = function() {

    this.World = function World(next) {

        var EC = protractor.ExpectedConditions;

        this.setCredentials = function(username, password) {
            element(by.model('credentials.username')).sendKeys( username );
            element(by.model('credentials.password')).sendKeys( password );
        };

        this.logout = function(cb) {
            // http://stackoverflow.com/questions/21259235/remove-an-item-from-localstorage-in-a-protractor-test
            // browser.executeScript('window.localStorage.setItem("TPMtoken", "");');

            var logoutButton = element(by.css('a[href="#logout"]'));

            logoutButton.isPresent().then(function(exists) {
                if ( exists === true ) {
                    logoutButton.click().then(function() {
                        cb();
                    });
                } else {
                    cb();
                }
            });
        };

        this.clickLogin = function(cb) {
            element(by.css('button[type="submit"]')).click().then(function() {
                var conditionSuccess = EC.presenceOf( $('a[href="#logout"]') ),
                    conditionFailed  = EC.presenceOf( $('.fdb') );

                // wait until either:
                // - the logout button is present in the DOM (successful login)
                // - the error message ispresent in the DOM (failed login)
                browser.wait( EC.or( conditionSuccess, conditionFailed ), 5000 );
                cb();
            });
        };

        next();
    };

};
