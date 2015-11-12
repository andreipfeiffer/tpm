(function() {

    'use strict';

    describe('Settings Controllers', function() {

        beforeEach(module('tpm'));

        describe('SettingsController without Google Access', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'settings/google').respond({
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

                $httpBackend.expectDELETE(TPM.apiUrl + 'auth/google').respond(205);
                scope.revokeGoogleAccess();
                $httpBackend.flush();

                expect(scope.settings.googleToken).toBeFalsy();
            });

        });


        describe('SettingsController with Google Access', function() {
            var scope, ctrl, $httpBackend,
                calendarsList = {
                    items: [
                        { id: 1 },
                        { id: 2 },
                        { id: 3 }
                    ]
                };

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'settings/google').respond({
                    googleToken: true,
                    calendars: calendarsList,
                    selectedCalendar: 1
                });

                scope = $rootScope.$new();
                ctrl = $controller('SettingsController', {$scope: scope});
            }));


            it('should have the selectedCalendar set', function() {
                $httpBackend.flush();
                expect(scope.selectedCalendar).toEqual(calendarsList.items[0]);
            });

        });
    });

})();
