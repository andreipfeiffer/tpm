(function() {

    'use strict';

    describe('Projects Controllers', function() {

        beforeEach(module('tpm'));

        describe('ProjectsListController', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'projects').respond( TPM.mocks.projectsList );
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond( TPM.mocks.clientsList );

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

                expect(scope.projectsList.length).toEqual( TPM.mocks.projectsList.length );
                expect(scope.projectsList[0].clientName).toBeDefined();

                var project1 = scope.projectsList[0];
                expect(project1.clientName).toEqual( getClientById(project1.idClient).name );

                var project2 = scope.projectsList[1];
                expect(project2.clientName).toContain('-');
            });

            it('should delete a project', function() {
                $httpBackend.flush();

                scope.deleteProject(0);
                expect(scope.projectsList.length).toEqual( TPM.mocks.projectsList.length - 1 );
            });

        });
    });

})();
