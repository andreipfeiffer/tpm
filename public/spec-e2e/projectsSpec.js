(function() {

    'use strict';

    describe('Login', function() {

        beforeEach(function() {
            browser.get('/');
        });

        it('should redirect users to /login', function() {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url.split('#')[1]).toBe('/login');
            });
        });

        it('should redirect users to /login when accessing protected routes', function() {
            browser.setLocation('/projects');
            browser.getLocationAbsUrl().then(function(url) {
                expect(url.split('#')[1]).toBe('/login');
            });
        });

        it('should display error message on wrong credentials', function() {
            element(by.model('credentials.username')).sendKeys('xxx');
            element(by.model('credentials.password')).sendKeys('yyy');

            expect( $('.alert').isDisplayed() ).toBeFalsy();

            element(by.css('button[type="submit"]')).click().then(function() {
                expect( $('.alert').isDisplayed() ).toBeTruthy();
            });
        });

        it('should login the user and redirect to projects, on correct credentials', function() {
            element(by.model('credentials.username')).sendKeys('asd');
            element(by.model('credentials.password')).sendKeys('asdasd');

            element(by.css('button[type="submit"]')).click().then(function() {
                browser.getLocationAbsUrl().then(function(url) {
                    expect(url.split('#')[1]).toBe('/projects');
                });
            });
        });

    });

})();