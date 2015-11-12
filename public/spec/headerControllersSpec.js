(function() {

    'use strict';

    describe('Header Controllers', function() {

        beforeEach(module('tpm'));

        describe('MenuController', function() {
            var scope, ctrl, location;

            beforeEach(inject(function($rootScope, $controller, $location) {
                location = $location;
                scope    = $rootScope.$new();
                ctrl     = $controller('MenuController', {$scope: scope});
            }));


            it('should return true, if the location path matches', function() {
                location.path('/projects');
                expect(scope.isActive('projects')).toBeTruthy();
            });

            it('should return false, if the location path does not match', function() {
                location.path('/asdasd');
                expect(scope.isActive('projects')).toBeFalsy();
            });

        });
    });

})();
