(function() {

    'use strict';

    describe('ProjectsController', function() {

        beforeEach(module('tmp'));

        it('should create "phones" model with 3 phones', inject(function($controller) {
            var scope = {},
                ctrl = $controller('ProjectsController', {$scope:scope});

            expect(scope.projectsList.length).toBe(2);
        }));
    });

})();