(function() {

    'use strict';

    var setCredentials = function(username, password) {
        element(by.model('credentials.username')).sendKeys( username );
        element(by.model('credentials.password')).sendKeys( password );
    };

    describe('Login', function() {

        beforeEach(function() {
            browser.get('/');
        });

        afterEach(function() {
            browser.executeScript('localStorage.setItem("TPMtoken", "");');
        });

        it('should redirect users to /login', function() {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/login');
            });
        });

        it('should redirect users to /login when accessing protected routes', function() {
            browser.setLocation('/projects');
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/login');
            });
        });

        it('should display error message on wrong credentials', function() {
            setCredentials('xxx', 'yyy');

            expect( $('.fdb').isDisplayed() ).toBeFalsy();

            element(by.css('button[type="submit"]')).click().then(function() {
                expect( $('.fdb-error').isDisplayed() ).toBeTruthy();
            });
        });

        it('should login the user and redirect to projects, on correct credentials', function() {
            setCredentials('asd', 'asdasd');

            element(by.css('button[type="submit"]')).click().then(function() {
                browser.getLocationAbsUrl().then(function(url) {
                    expect(url).toBe('/projects');
                });
            });
        });

        it('should logout the user, redirecting to login', function() {
            setCredentials('asd', 'asdasd');

            element(by.css('button[type="submit"]')).click().then(function() {
                element(by.css('a[href="#logout"]')).click().then(function() {
                    browser.getLocationAbsUrl().then(function(url) {
                        expect(url).toBe('/login');
                    });
                });
            });
        });

    });

})();