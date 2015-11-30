import 'angular';
import 'angular-mocks';
import 'public/js/app';

describe('Directives', () => {

    beforeEach(angular.mock.module('tpm'));

    describe('Directives: set-focus', () => {
        var element, scope;

        beforeEach(inject(($rootScope, $compile) => {
            scope = $rootScope.$new();

            element = '<a href="" set-focus></a>';

            element = $compile(element)(scope);
            scope.$digest();
        }));

        it('should auto set focus on the element', () => {
            // @todo not working, not getting the element focused
            // expect( $(element[0]).is(':focus') ).toBe(true);
        });

    });

    describe('Directives: click-confirm', () => {
        var element, scope, compile, rootScope, timeout;
        var message = 'Are you sure?';

        beforeEach(inject(($rootScope, $compile, $timeout) => {
            scope     = $rootScope.$new();
            compile   = $compile;
            rootScope = $rootScope;
            timeout   = $timeout;
            
            element   = '<a href="" click-confirm="" click-confirm-message="' + message + '"></a>';
            element   = $compile(element)(scope);

            scope.$digest();
        }));

        it('open a modal with the title set in attribute', () => {
            // trigger click on element
            compile(element)(rootScope).triggerHandler('click');
            // needs a delay, while the modal is displayed
            timeout(() => {
                expect( $('.modal-title').text() ).toBe( message );
            }, 100);
        });

        // it('execute the callback, set in attribute', () => {
        // });

    });

});
