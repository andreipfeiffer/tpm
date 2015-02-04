module.exports = function() {

    this.World = function World(next) {

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

        next();
    };

};
