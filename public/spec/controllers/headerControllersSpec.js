import 'angular';
import 'angular-mocks';
import 'public/js/app';

describe('Header Controllers', () => {

    beforeEach(angular.mock.module('tpm'));

    describe('MenuController', () => {
        var scope, ctrl, location;

        beforeEach(inject(($rootScope, $controller, $location) => {
            location = $location;
            scope    = $rootScope.$new();
            ctrl     = $controller('MenuController', {$scope: scope});
        }));


        it('should return true, if the location path matches', () => {
            location.path('/projects');
            expect(scope.isActive('projects')).toBeTruthy();
        });

        it('should return false, if the location path does not match', () => {
            location.path('/asdasd');
            expect(scope.isActive('projects')).toBeFalsy();
        });

    });
});
