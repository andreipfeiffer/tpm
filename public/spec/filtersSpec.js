import 'angular';
import 'angular-mocks';
import 'public/js/app';

(function() {

    'use strict';

    describe('TPM.Filters', function() {

        beforeEach(angular.mock.module('TPM.Filters'));

        describe('filterByProjectStatus', function() {
            var filter;

            beforeEach(function() {
                inject(function($injector){
                    filter = $injector.get('$filter')('filterByProjectStatus');
                });

                jasmine.addMatchers( TPM.customMatchers );
            });

            it('should return empty array, if passed value is not array', function() {
                expect(filter(undefined)).toEqualDeep([]);
            });

            it('should return a filtered by status array', function() {
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

})();
