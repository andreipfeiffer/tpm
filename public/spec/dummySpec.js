(function() {

    'use strict';

    describe('ProjectsController', function() {

        beforeEach(module('tmp'));

        it('should contain 2 projects', inject(function($controller) {
            var scope = {},
                ctrl = $controller('ProjectsController', {$scope:scope});

            expect(scope.projectsList.length).toBe(2);
        }));
    });

})();