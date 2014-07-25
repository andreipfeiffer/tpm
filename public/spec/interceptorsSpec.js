(function() {

    'use strict';

    describe('Interceptors', function() {

        beforeEach(module('tpm'));

        describe('authInterceptor', function() {
            var scope, controller, $httpBackend, location, Session;
            var token = 'abcdef';

            beforeEach(inject(function(_$httpBackend_, _$location_, $rootScope, $controller, _SessionService_) {
                $httpBackend = _$httpBackend_;
                location = _$location_;
                Session = _SessionService_;
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond(401);

                scope = $rootScope.$new();
                controller = $controller;

                location.path('/clients');
                Session.setAuthToken( token );
            }));


            it('should redirect logged users if they get a request with the status "401"', function() {

                // load a random controller to trigger a request
                controller('ClientsListController', {$scope: scope});
                $httpBackend.flush();

                expect(location.path()).toEqual('/login');
                expect(Session.getAuthToken()).not.toEqual( token );
            });

        });
    });

})();