import 'angular';
import 'angular-mocks';
import 'public/js/app';
import config from 'public/js/appConfig';

(function() {

    'use strict';

    describe('Auth Controllers', function() {

        beforeEach(angular.mock.module('tpm'));

        describe('LoginController', function() {
            var scope, controller, $httpBackend, location, AuthToken, feedback;

            beforeEach(inject(function(_$httpBackend_, _$location_, $rootScope, $controller, _AuthToken_, _feedback_) {
                $httpBackend = _$httpBackend_;
                location     = _$location_;
                AuthToken    = _AuthToken_;
                feedback     = _feedback_;
                scope        = $rootScope.$new();

                location.path('/login');
                controller = $controller;
            }));

            afterEach(function() {
                AuthToken.remove();
            });


            it('should set error message with wrong credentials', function() {
                controller('LoginController', {$scope: scope});

                scope.credentials = {
                    username: 'xxx',
                    password: 'xxx'
                };

                $httpBackend.expectPOST(config.getApiUrl() + 'login').respond(401, { 'error': 'bad credentials' });

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

                $httpBackend.expectPOST(config.getApiUrl() + 'login').respond(200, { 'authToken': token });
                $httpBackend.expectGET(config.getApiUrl() + 'settings/user').respond(200);

                scope.login();
                $httpBackend.flush();

                expect(AuthToken.get()).toEqual( token );
                expect(location.path()).not.toEqual('/login');
            });

            it('should redirect already logged users', function() {

                // login user
                AuthToken.set('abcdef');

                controller('LoginController', {$scope: scope});
                expect(location.path()).not.toEqual('/login');

            });

        });


        describe('LogoutController', function() {
            var scope, controller, $httpBackend, location, AuthToken;
            var token = 'abcdef';

            beforeEach(inject(function(_$httpBackend_, _$location_, $rootScope, $controller, _AuthToken_) {
                $httpBackend = _$httpBackend_;
                location     = _$location_;
                AuthToken    = _AuthToken_;
                scope        = $rootScope.$new();

                // authenticate the user
                AuthToken.set( token );

                controller = $controller;
            }));


            it('should logout and redirect to login', function() {

                controller('LogoutController', {$scope: scope});

                $httpBackend.expectGET(config.getApiUrl() + 'logout').respond(200);
                $httpBackend.flush();

                expect(AuthToken.get()).not.toEqual( token );
                expect(AuthToken.get()).toBeFalsy();
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
