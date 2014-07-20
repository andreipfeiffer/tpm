(function() {

    'use strict';

    describe('Clients Controllers', function() {

        beforeEach(module('tpm'));

        describe('ClientsListController', function() {
            var scope, ctrl, $httpBackend;
            var mockResponse = [
                    {
                        "id": 1,
                        "idUser": 1,
                        "name": "client Ana",
                        "dateCreated": "2014-07-14T19:10:55.000Z",
                        "nrProjects": 2
                    },
                    {
                        "id": 2,
                        "idUser": 1,
                        "name": "client Ion",
                        "dateCreated": "2014-07-14T19:10:55.000Z",
                        "nrProjects": 1
                    }
                ];

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond(mockResponse);

                scope = $rootScope.$new();
                ctrl = $controller('ClientsListController', {$scope: scope});
            }));


            it('should set the response from the ApiServiceQuery to $scope.clientsList', function() {
                expect(scope.clientsList).toEqualDeep([]);
                $httpBackend.flush();

                expect(scope.clientsList).toEqualDeep(mockResponse);
            });

        });
    });

})();
