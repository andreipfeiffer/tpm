module.exports = function() {

    this.World = function World() {

        var EC = protractor.ExpectedConditions;

        this.setCredentials = function(username, password) {
            element(by.model('credentials.username')).sendKeys( username );
            element(by.model('credentials.password')).sendKeys( password );
        };

        this.localStorage = {
            getItem: function(item) {
                return browser.executeScript("return window.localStorage.getItem('" + item + "');");
            },
            setItem: function(item, val) {
                return browser.executeScript("window.localStorage.setItem('" + item + "', '" + val + "');");
            }
        };

        this.logout = function(cb) {
            var myAccountButton = element( by.css('a.my-account') );
            var logoutButton = element(by.css('a[href="#logout"]'));

            myAccountButton.isPresent().then(function(exists) {
                if ( exists === true ) {
                    myAccountButton.click();
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
                // - the error message is present in the DOM (failed login)

                browser.wait(() => {
                    // https://github.com/angular/protractor/issues/2643
                    browser.ignoreSynchronization = false;
                    return EC.or( conditionSuccess, conditionFailed );
                }, 5000);

                cb();
            });
        };

    };

};
