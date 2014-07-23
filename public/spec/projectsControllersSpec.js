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


        describe('ProjectsNewController', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond( TPM.mocks.clientsList );

                scope = $rootScope.$new();
                ctrl = $controller('ProjectsNewController', {$scope: scope});
            }));


            it('should create a new project', function() {
                $httpBackend.flush();

                expect(scope.project.name).toEqual('');

                scope.project.name = 'new project name';
                $httpBackend.expectPOST(TPM.apiUrl + 'projects').respond(201);

                scope.submitForm();
                $httpBackend.flush();
            });

            it('should display the date picker', function() {
                $httpBackend.flush();

                scope.openDatePicker( $.Event('click') );
                expect(scope.isDatePickerOpened).toBeTruthy();
            });

        });


        describe('ProjectsEditController', function() {
            var scope, ctrl, $httpBackend;
            // the controller reads the id from routeParams
            // we need this so the GET request for details works as expected
            var routeParams = { id: 1 };
            var projectDetails = TPM.mocks.projectsList[0];

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'projects/1').respond( projectDetails );
                $httpBackend.expectGET(TPM.apiUrl + 'clients').respond( TPM.mocks.clientsList );

                scope = $rootScope.$new();
                ctrl = $controller('ProjectsEditController', {$scope: scope, $routeParams : routeParams});
            }));


            it('should edit a project', function() {
                $httpBackend.flush();

                expect(scope.project.name).toEqual(projectDetails.name );

                scope.project.name = 'new project name';
                $httpBackend.expectPUT(TPM.apiUrl + 'projects/1', angular.toJson(scope.project)).respond(201, scope.project);

                scope.submitForm();
                $httpBackend.flush();
            });

            it('should display the date picker', function() {
                $httpBackend.flush();

                scope.openDatePicker( $.Event('click') );
                expect(scope.isDatePickerOpened).toBeTruthy();
            });

        });


        describe('ProjectsViewController', function() {
            var scope, ctrl, $httpBackend;
            var routeParams = { id: 1 };
            var projectDetails = TPM.mocks.projectsList[0];

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'projects/1').respond( projectDetails );

                scope = $rootScope.$new();
                ctrl = $controller('ProjectsViewController', {$scope: scope, $routeParams : routeParams});
            }));


            it('should edit a project', function() {
                $httpBackend.flush();

                expect(scope.project.name).toEqual(projectDetails.name );
            });

        });

    });

})();
