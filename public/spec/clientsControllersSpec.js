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

        });
    });

})();
