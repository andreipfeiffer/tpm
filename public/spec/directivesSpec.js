(function() {

    'use strict';

    describe('Directives: client-select', function() {
        var element, scope;

        beforeEach(module('tpm'));

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = '<client-select></client-select>';

            // mock some data for directive
            scope.clientsList = TPM.mocks.clientsList;

            element = $compile(element)(scope);
            scope.$digest();
        }));

        it('should populate the options list with clients, and add the default one', function() {
            // var isolated = element.isolateScope();
            expect(element.find('option').length).toBe( TPM.mocks.clientsList.length + 1 );
        });

    });

})();
