(function() {

    'use strict';

    describe('Interceptors', function() {

        beforeEach(module('tpm'));

        describe('authInterceptor', function() {
            var scope, controller, $httpBackend, location, Session, feedback;
            var token = 'abcdef';

            beforeEach(inject(function(_$httpBackend_, _$location_, $rootScope, $controller, _SessionService_, _feedback_) {
                $httpBackend = _$httpBackend_;
                location     = _$location_;
                Session      = _SessionService_;
                feedback     = _feedback_;

                scope = $rootScope.$new();
                controller = $controller;

                location.path('/clients');
                Session.setAuthToken( token );
            }));


            it('should redirect logged users if they get a request with the status "401"', function() {

                // load a random controller to trigger a request
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond(401);
                controller('ClientsListController', {$scope: scope});
                $httpBackend.flush();

                expect(location.path()).toEqual('/login');
                expect(Session.getAuthToken()).not.toEqual( token );
            });

            it('should display feedback message for status "5xx"', function() {

                // load a random controller to trigger a request
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond(500);
                controller('ClientsListController', {$scope: scope});
                $httpBackend.flush();

                expect(feedback.isActive()).toBeTruthy();
                expect(feedback.getType()).toEqual('error');
            });

            it('should display feedback message for status "0"', function() {

                // load a random controller to trigger a request
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond(0);
                controller('ClientsListController', {$scope: scope});
                $httpBackend.flush();

                expect(feedback.isActive()).toBeTruthy();
                expect(feedback.getType()).toEqual('error');
                expect(feedback.getMessage()).toContain('offline');
            });

        });
    });

})();
