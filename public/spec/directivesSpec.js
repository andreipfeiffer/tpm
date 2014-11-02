(function() {

    'use strict';

    beforeEach(module('tpm'));

    describe('Directives: client-select', function() {
        var element, scope;

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

    describe('Directives: set-focus', function() {
        var element, scope;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = '<a href="" set-focus></a>';

            element = $compile(element)(scope);
            scope.$digest();
        }));

        it('should auto set focus on the element', function() {
            // @todo not working, not getting the element focused
            // expect( $(element[0]).is(':focus') ).toBeTruthy();
        });

    });

    describe('Directives: click-confirm', function() {
        var element, scope, compile, rootScope, timeout;
        var message = 'Are you sure?';

        beforeEach(inject(function($rootScope, $compile, $timeout) {
            scope = $rootScope.$new();
            compile = $compile;
            rootScope = $rootScope;
            timeout = $timeout;

            element = '<a href="" click-confirm="" click-confirm-message="' + message + '"></a>';

            element = $compile(element)(scope);
            scope.$digest();
        }));

        it('open a modal with the title set in attribute', function() {
            // trigger click on element
            compile(element)(rootScope).triggerHandler('click');
            // needs a delay, while the modal is displayed
            timeout(function() {
                expect( $('.modal-title').text() ).toBe( message );
            }, 100);
        });

        // it('execute the callback, set in attribute', function() {
        // });

    });

})();
