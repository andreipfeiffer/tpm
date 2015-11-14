(function() {

    'use strict';

    describe('Status Controllers', function() {

        beforeEach(module('tpm'));

        describe('StatusController', function() {
            var scope, ctrl, websocket;

            beforeEach(inject(function($rootScope, $controller, _websocket_) {
                websocket = _websocket_;
                scope     = $rootScope.$new();

                // stub missing method before we instantiate the controller
                websocket.removeAllListeners = jasmine.createSpy();

                ctrl = $controller('StatusController', {$scope: scope});
            }));

            it('should receive data when "status.get" is emitted', function() {
                expect( scope.status.users ).toEqual( 0 );
                websocket.receive('status.data', { users: 2 } );
                expect( scope.status.users ).toEqual( 2 );

                expect( scope.status.projects ).toEqual( 0 );
                websocket.receive('status.data', { projects: 3 } );
                expect( scope.status.projects ).toEqual( 3 );

                expect( scope.status.income ).toEqual( 0 );
                websocket.receive('status.data', { income: 11 } );
                expect( scope.status.income ).toEqual( 11 );
            });

        });
    });

})();
