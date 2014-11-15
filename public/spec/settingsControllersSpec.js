(function() {

    'use strict';

    describe('Settings Controllers', function() {

        beforeEach(module('tpm'));

        describe('SettingsController', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'settings').respond({
                    googleToken: false
                });

                scope = $rootScope.$new();
                ctrl = $controller('SettingsController', {$scope: scope});
            }));


            it('should set settings.googleToken', function() {
                $httpBackend.flush();
                expect(scope.settings.googleToken).toBeDefined();
                expect(scope.settings.googleToken).toBeFalsy();
            });

            it('should set the loader when Google access is requested', function() {
                $httpBackend.flush();
                scope.getGoogleAccess();
                expect(scope.isLoadingGoogle).toBeTruthy();
            });

            it('should revoke googleToken', function() {
                $httpBackend.flush();
                scope.settings.googleToken = false;

                $httpBackend.expectDELETE(TPM.apiUrl + 'settings/google').respond(200);
                scope.revokeGoogleAccess();
                $httpBackend.flush();

                expect(scope.settings.googleToken).toBeFalsy();
            });

        });
    });

})();
