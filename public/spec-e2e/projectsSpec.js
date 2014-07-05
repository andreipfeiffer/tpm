(function() {

    'use strict';

    describe('Projects', function() {

        it('should redirect index.html to index.html#/projects', function() {
            browser.get('index.html');
            browser.getLocationAbsUrl().then(function(url) {
                expect(url.split('#')[1]).toBe('/projects');
            });
        });

    });

})();