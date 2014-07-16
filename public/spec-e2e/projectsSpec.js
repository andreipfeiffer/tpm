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

    });

})();