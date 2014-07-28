(function() {

    'use strict';

    describe('TPM.Filters', function() {

        beforeEach(module('TPM.Filters'));

        describe('filterByProjectStatus', function() {
            var filter;

            beforeEach(function() {
                inject(function($injector){
                    filter = $injector.get('$filter')('filterByProjectStatus');
                });
            });

            it('should return empty array, if passed value is not array', function() {
                expect(filter(undefined)).toEqualDeep([]);
            });

            it('should return a filtered by status array', function() {
                var arr = [
                    { status: 'on hold' },
                    { status: 'in progress' },
                    { status: 'on hold' }
                ];

                expect( filter(arr, 'on hold').length ).toBe(2);
                expect( filter(arr, 'in progress').length ).toBe(1);
            });

        });

    });

})();
