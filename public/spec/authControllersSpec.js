(function() {

    'use strict';

    describe('Auth Controllers', function() {

        beforeEach(module('tpm'));


        describe('LoginController', function() {
            var scope, ctrl, $httpBackend, location, Session;

            beforeEach(inject(function(_$httpBackend_, _$location_, $rootScope, $controller, _SessionService_) {
                $httpBackend = _$httpBackend_;
                location = _$location_;
                Session = _SessionService_;

                scope = $rootScope.$new();
                ctrl = $controller('LoginController', {$scope: scope});
            }));


            it('should set error message with wrong credentials', function() {
                var expectedError = 'bad credentials';

                scope.credentials = {
                    username: 'xxx',
                    password: 'xxx'
                };

                $httpBackend.expectPOST(TPM.apiUrl + 'login').respond(401, { 'error': expectedError });

                scope.login();
                $httpBackend.flush();

                expect(scope.errorMessage).toBe( expectedError );
                expect(location.path()).toEqual('/login');
            });

            it('should login and redirect with correct credentials', function() {
                var token = 'fdab0fb82c66a2b802266b3a5478bf39';

                scope.credentials = {
                    username: 'asd',
                    password: 'asdasd'
                };

                $httpBackend.expectPOST(TPM.apiUrl + 'login').respond(200, { 'authToken': token });

                scope.login();
                $httpBackend.flush();

                expect(Session.getAuthToken()).toEqual( token );
                expect(location.path()).not.toEqual('/login');
            });

        });

    });

})();
