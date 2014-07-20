(function() {

    'use strict';

    describe('Projects Controllers', function() {

        beforeEach(module('tpm'));

        describe('ProjectsListController', function() {
            var scope, ctrl, $httpBackend;

            var mockResponseProjects = [
                {
                    "id": 1,
                    "idUser": 1,
                    "idClient": 1,
                    "name": "Pufosenie roz",
                    "isCompleted": ""
                },
                {
                    "id": 2,
                    "idUser": 1,
                    "idClient": 0,
                    "name": "Album foto",
                    "isCompleted": ""
                }
            ];

            var mockResponseClients = [
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
                $httpBackend.expectGET(TPM.apiUrl + 'projects').respond(mockResponseProjects);
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond(mockResponseClients);

                scope = $rootScope.$new();
                ctrl = $controller('ProjectsListController', {$scope: scope});
            }));


            it('should set the response from the API to $scope.projectsList', function() {
                function getClientById(id) {
                    var filtered = scope.clientsList.filter(function(client) {
                        return client.id === id;
                    });

                    return filtered[0];
                }

                expect(scope.projectsList).toEqualDeep([]);
                $httpBackend.flush();

                expect(scope.projectsList.length).toEqualDeep(mockResponseProjects.length);
                expect(scope.projectsList[0].clientName).toBeDefined();

                var project1 = scope.projectsList[0];
                expect(project1.clientName).toEqual( getClientById(project1.idClient).name );

                var project2 = scope.projectsList[1];
                expect(project2.clientName).toContain('-');
            });

        });
    });

})();
