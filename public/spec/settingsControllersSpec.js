import 'angular';
import 'angular-mocks';
import tpm from 'public/js/main';

(function() {

    'use strict';

    describe('Settings Controllers', function() {

        beforeEach(angular.mock.module('tpm'));

        describe('SettingsController without Google Access', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'settings/google').respond({
                    googleToken: false
                });

                scope = $rootScope.$new();
                ctrl  = $controller('SettingsController', {$scope: scope});
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
                    googleToken     : true,
                    calendars       : calendarsList,
                    selectedCalendar: 1
                });

                scope = $rootScope.$new();
                ctrl  = $controller('SettingsController', {$scope: scope});
            }));


            it('should have the selectedCalendar set', function() {
                $httpBackend.flush();
                expect(scope.selectedCalendar).toEqual(calendarsList.items[0]);
            });

        });


        describe('SettingsUser', function() {
            var scope, ctrl, $httpBackend, SettingsUser;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _SettingsUser_) {
                SettingsUser = _SettingsUser_;
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'settings/google').respond({
                    googleToken: false
                });

                scope = $rootScope.$new();
                ctrl  = $controller('SettingsController', {$scope: scope});
            }));

            it('should saveUserSettings()', function() {
                $httpBackend.flush();
                expect( scope.user.data.currency ).toEqual('RON');

                scope.user.data.currency = 'EUR';

                $httpBackend.expectPUT(TPM.apiUrl + 'settings/user', scope.user.data).respond( 200 );
                scope.saveUserSettings();
                $httpBackend.flush();

                expect( SettingsUser.get().currency ).toEqual('EUR');
            });

        });
    });

})();
