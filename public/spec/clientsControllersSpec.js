import 'angular';
import 'angular-mocks';
import tpm from 'public/js/main';

(function() {

    'use strict';

    describe('Clients Controllers', function() {

        beforeEach(angular.mock.module('tpm'));

        describe('ClientsListController', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond( TPM.mocks.clientsList );
                $httpBackend.whenGET(/views\//).respond(200);

                scope = $rootScope.$new();
                ctrl = $controller('ClientsListController', {$scope: scope});

                // stub the form methods
                scope.clientsForm = {
                    $setPristine: function() {}
                };

                jasmine.addMatchers( TPM.customMatchers );
            }));


            it('should set the response from the API to $scope.clientsList', function() {
                expect(scope.clientsList).toBeUndefined();
                $httpBackend.flush();

                expect(scope.clientsList).toEqualDeep( TPM.mocks.clientsList );
            });

            it('should toggle the New Client form', function() {
                $httpBackend.flush();

                expect(scope.isFormNewDisplayed).toBeFalsy();
                scope.toggleNewFormDisplay();
                expect(scope.isFormNewDisplayed).toBeTruthy();
            });

            it('should add a new client', function() {
                $httpBackend.flush();

                scope.toggleNewFormDisplay();
                scope.newClient.name = 'New client';

                $httpBackend.expectPOST(TPM.apiUrl + 'clients').respond(201);
                scope.addNewClient();
                $httpBackend.flush();

                expect(scope.clientsList.length).toBe( TPM.mocks.clientsList.length + 1 );
                expect(scope.newClient.name).toBe('');
            });

            it('should edit a client', function() {
                var client = TPM.mocks.clientsList[0];
                $httpBackend.flush();

                var newClientData = angular.extend( {}, client );
                newClientData.name = 'Edited client name';

                $httpBackend.expectPUT(TPM.apiUrl + 'clients/' + client.id).respond(200);
                scope.editClient( newClientData );
                $httpBackend.flush();

                expect(scope.clientsList[0]).toEqualDeep( newClientData );
            });

            it('should delete a client', function() {
                $httpBackend.flush();

                scope.deleteClient( TPM.mocks.clientsList[0].id );
                expect(scope.clientsList.length).toEqual( TPM.mocks.clientsList.length - 1 );
            });

        });
    });

})();
