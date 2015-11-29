import 'angular';
import 'angular-mocks';
import 'public/js/main';

(function() {

    'use strict';

    describe('Auth Controllers', function() {

        beforeEach(angular.mock.module('tpm'));

        describe('LoginController', function() {
            var scope, controller, $httpBackend, location, Session, feedback;

            beforeEach(inject(function(_$httpBackend_, _$location_, $rootScope, $controller, _SessionService_, _feedback_) {
                $httpBackend = _$httpBackend_;
                location     = _$location_;
                Session      = _SessionService_;
                feedback     = _feedback_;
                scope        = $rootScope.$new();

                location.path('/login');
                controller = $controller;
            }));

            afterEach(function() {
                Session.removeAuthToken();
            });


            it('should set error message with wrong credentials', function() {
                controller('LoginController', {$scope: scope});

                scope.credentials = {
                    username: 'xxx',
                    password: 'xxx'
                };

                $httpBackend.expectPOST(TPM.apiUrl + 'login').respond(401, { 'error': 'bad credentials' });

                scope.login();
                $httpBackend.flush();

                expect(feedback.isActive()).toBeTruthy();
                expect(feedback.getType()).toBe('error');
                expect(location.path()).toEqual('/login');
            });

            it('should login and redirect with correct credentials', function() {
                var token = 'fdab0fb82c66a2b802266b3a5478bf39';

                controller('LoginController', {$scope: scope});

                scope.credentials = {
                    username: 'asd',
                    password: 'asdasd'
                };

                $httpBackend.expectPOST(TPM.apiUrl + 'login').respond(200, { 'authToken': token });
                $httpBackend.expectGET(TPM.apiUrl + 'settings/user').respond(200);

                scope.login();
                $httpBackend.flush();

                expect(Session.getAuthToken()).toEqual( token );
                expect(location.path()).not.toEqual('/login');
            });

            it('should redirect already logged users', function() {

                // login user
                Session.setAuthToken('abcdef');

                controller('LoginController', {$scope: scope});
                expect(location.path()).not.toEqual('/login');

            });

        });


        describe('LogoutController', function() {
            var scope, controller, $httpBackend, location, Session;
            var token = 'abcdef';

            beforeEach(inject(function(_$httpBackend_, _$location_, $rootScope, $controller, _SessionService_) {
                $httpBackend = _$httpBackend_;
                location     = _$location_;
                Session      = _SessionService_;
                scope        = $rootScope.$new();

                // authenticate the user
                Session.setAuthToken( token );

                controller = $controller;
            }));


            it('should logout and redirect to login', function() {

                controller('LogoutController', {$scope: scope});

                $httpBackend.expectGET(TPM.apiUrl + 'logout').respond(200);
                $httpBackend.flush();

                expect(Session.getAuthToken()).not.toEqual( token );
                expect(Session.getAuthToken()).toBeFalsy();
                expect(location.path()).toEqual('/login');
            });

        });


        // @todo should this belong here?
        describe('Redirection', function() {
            var scope, location, rootScope;

            beforeEach(inject(function(_$location_, $rootScope) {
                location  = _$location_;
                rootScope = $rootScope;
                scope     = rootScope.$new();
            }));


            it('should redirect if trying to access protected routes', function() {

                // try to access another route, without being logged in
                location.path('/clients');
                rootScope.$apply();

                expect(location.path()).toEqual('/login');

            });

        });

    });

})();
