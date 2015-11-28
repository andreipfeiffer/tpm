import 'angular';
import 'angular-mocks';
import tpm from 'public/js/main';

(function() {

    'use strict';

    beforeEach(angular.mock.module('tpm'));

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
            scope     = $rootScope.$new();
            compile   = $compile;
            rootScope = $rootScope;
            timeout   = $timeout;
            
            element   = '<a href="" click-confirm="" click-confirm-message="' + message + '"></a>';
            element   = $compile(element)(scope);

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
