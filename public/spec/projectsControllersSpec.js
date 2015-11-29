import 'angular';
import 'angular-mocks';
import 'public/js/app';
import utils from 'public/js/utils';
import config from 'public/js/appConfig';

(function() {

    'use strict';

    describe('Projects Controllers', function() {

        beforeEach(angular.mock.module('tpm'));

        describe('ProjectsListController', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(config.getApiUrl() + 'projects').respond( TPM.mocks.projectsList );
                $httpBackend.expectGET(config.getApiUrl() + 'clients').respond( TPM.mocks.clientsList );

                scope = $rootScope.$new();
                ctrl = $controller('ProjectsListController', {$scope: scope});

                jasmine.addMatchers( TPM.customMatchers );
            }));


            it('should set the response from the API to $scope.projectsList', function() {
                function getClientById(id) {
                    var filtered = scope.clientsList.filter(function(client) {
                        return client.id === id;
                    });

                    return filtered[0];
                }

                expect(scope.projectsList).toBeUndefined();
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

                scope.deleteProject( TPM.mocks.projectsList[0].id );
                expect(scope.projectsList.length).toEqual( TPM.mocks.projectsList.length - 1 );
            });

            it('should set the status filter', function() {
                $httpBackend.flush();

                scope.setFilterStatus('random filter');
                expect(scope.filterStatus).toEqual('random filter');
            });

        });


        describe('ProjectsNewController', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(config.getApiUrl() + 'clients').respond( TPM.mocks.clientsList );
                $httpBackend.whenGET(/views\//).respond(200);

                scope = $rootScope.$new();
                ctrl = $controller('ProjectsNewController', {$scope: scope});
            }));


            it('should create a new project', function() {
                $httpBackend.flush();

                expect(scope.project.name).toEqual('');

                scope.project.name = 'new project name';
                $httpBackend.expectPOST(config.getApiUrl() + 'projects').respond(201);

                scope.submitForm();
                expect( utils.isDateFormat(scope.project.dateAdded) ).toBeTruthy();
                expect( utils.isDateFormat(scope.project.dateEstimated) ).toBeTruthy();
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
                $httpBackend.expectGET(config.getApiUrl() + 'projects/1').respond( projectDetails );
                $httpBackend.expectGET(config.getApiUrl() + 'clients').respond( TPM.mocks.clientsList );
                $httpBackend.whenGET(/views\//).respond(200);

                scope = $rootScope.$new();
                ctrl = $controller('ProjectsEditController', {$scope: scope, $routeParams : routeParams});
            }));


            it('should edit a project', function() {
                $httpBackend.flush();

                expect(scope.project.name).toEqual(projectDetails.name );

                scope.project.name = 'new project name';
                $httpBackend.expectPUT(config.getApiUrl() + 'projects/1').respond(201);

                scope.submitForm();
                expect( utils.isDateFormat(scope.project.dateAdded) ).toBeTruthy();
                expect( utils.isDateFormat(scope.project.dateEstimated) ).toBeTruthy();
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
                $httpBackend.expectGET(config.getApiUrl() + 'projects/1').respond( projectDetails );

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
