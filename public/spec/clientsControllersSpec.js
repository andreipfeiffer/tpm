(function() {

    'use strict';

    describe('Clients Controllers', function() {

        beforeEach(module('tpm'));

        describe('ClientsListController', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond( TPM.mocks.clientsList );

                scope = $rootScope.$new();
                ctrl = $controller('ClientsListController', {$scope: scope});
            }));


            it('should set the response from the API to $scope.clientsList', function() {
                expect(scope.clientsList).toEqualDeep([]);
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
                var nr = TPM.mocks.clientsList.length,
                    name = 'New client';

                $httpBackend.flush();

                scope.toggleNewFormDisplay();
                scope.newClient.name = name;

                $httpBackend.expectPOST(TPM.apiUrl + 'clients').respond(201);
                scope.addNewClient();
                $httpBackend.flush();

                expect(scope.clientsList.length).toBe( nr + 1 );
                expect(scope.newClient.name).toBe('');
            });

        });
    });

})();
