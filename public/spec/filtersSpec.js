import 'angular';
import 'angular-mocks';
import 'public/js/app';
import customMatchers from 'public/spec/_matchers';

describe('TPM.Filters', () => {

    beforeEach(angular.mock.module('TPM.Filters'));

    describe('filterByProjectStatus', () => {
        var filter;

        beforeEach(() => {
            inject(($injector)=> {
                filter = $injector.get('$filter')('filterByProjectStatus');
            });

            jasmine.addMatchers( customMatchers );
        });

        it('should return empty array, if passed value is not array', () => {
            expect(filter(undefined)).toEqualDeep([]);
        });

        it('should return a filtered by status array', () => {
            var arr = [
                { status: 'on hold' },
                { status: 'in progress' },
                { status: 'on hold' },
                { status: 'finished' },
                { status: 'paid' },
                { status: 'in progress' },
                { status: 'on hold' }
            ];

            expect( filter(arr, 'on hold').length ).toBe(3);
            expect( filter(arr, 'in progress').length ).toBe(2);
            expect( filter(arr, '').length ).toBe(5);
        });

    });

});
