import 'angular';
import 'angular-mocks';
import 'public/js/app';
import utils from 'public/js/utils';
import config from 'public/js/appConfig';
import customMatchers from 'public/spec/_matchers';
import stubs from 'public/spec/_stubs';

describe('Projects Controllers', () => {

    beforeEach(angular.mock.module('tpm'));

    describe('ProjectsListController', () => {
        var scope, ctrl, $httpBackend;

        beforeEach(inject((_$httpBackend_, $rootScope, $controller) => {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET(config.getApiUrl() + 'projects').respond( stubs.projectsList );
            $httpBackend.expectGET(config.getApiUrl() + 'clients').respond( stubs.clientsList );

            scope = $rootScope.$new();
            ctrl = $controller('ProjectsListController', {$scope: scope});

            jasmine.addMatchers( customMatchers );
        }));


        it('should set the response from the API to $scope.projectsList', () => {
            var getClientById = (id) => {
                return scope.clientsList.find( (client) => client.id === id );
            };

            expect(scope.projectsList).toBeUndefined();
            $httpBackend.flush();

            expect(scope.projectsList.length).toEqual( stubs.projectsList.length );
            expect(scope.projectsList[0].clientName).toBeDefined();

            var project1 = scope.projectsList[0];
            expect(project1.clientName).toEqual( getClientById(project1.idClient).name );

            var project2 = scope.projectsList[1];
            expect(project2.clientName).toContain('-');
        });

        it('should delete a project', () => {
            $httpBackend.flush();

            scope.deleteProject( stubs.projectsList[0].id );
            expect(scope.projectsList.length).toEqual( stubs.projectsList.length - 1 );
        });

        it('should set the status filter', () => {
            $httpBackend.flush();

            scope.setFilterStatus('random filter');
            expect(scope.filterStatus).toEqual('random filter');
        });

    });


    describe('ProjectsNewController', () => {
        var scope, ctrl, $httpBackend;

        beforeEach(inject((_$httpBackend_, $rootScope, $controller) => {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET(config.getApiUrl() + 'clients').respond( stubs.clientsList );
            $httpBackend.whenGET(/views\//).respond(200);

            scope = $rootScope.$new();
            ctrl = $controller('ProjectsNewController', {$scope: scope});
        }));


        it('should create a new project', () => {
            $httpBackend.flush();

            expect(scope.project.name).toEqual('');

            scope.project.name = 'new project name';
            $httpBackend.expectPOST(config.getApiUrl() + 'projects').respond(201);

            scope.submitForm();
            expect( utils.isDateFormat(scope.project.dateAdded) ).toBeTruthy();
            expect( utils.isDateFormat(scope.project.dateEstimated) ).toBeTruthy();
            $httpBackend.flush();
        });

        it('should display the date picker', () => {
            $httpBackend.flush();

            scope.openDatePicker( $.Event('click') );
            expect(scope.isDatePickerOpened).toBeTruthy();
        });

    });


    describe('ProjectsEditController', () => {
        var scope, ctrl, $httpBackend;
        // the controller reads the id from routeParams
        // we need this so the GET request for details works as expected
        var routeParams = { id: 1 };
        var projectDetails = stubs.projectsList[0];

        beforeEach(inject((_$httpBackend_, $rootScope, $controller) => {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET(config.getApiUrl() + 'projects/1').respond( projectDetails );
            $httpBackend.expectGET(config.getApiUrl() + 'clients').respond( stubs.clientsList );
            $httpBackend.whenGET(/views\//).respond(200);

            scope = $rootScope.$new();
            ctrl = $controller('ProjectsEditController', {$scope: scope, $routeParams : routeParams});
        }));


        it('should edit a project', () => {
            $httpBackend.flush();

            expect(scope.project.name).toEqual(projectDetails.name );

            scope.project.name = 'new project name';
            $httpBackend.expectPUT(config.getApiUrl() + 'projects/1').respond(201);

            scope.submitForm();
            expect( utils.isDateFormat(scope.project.dateAdded) ).toBeTruthy();
            expect( utils.isDateFormat(scope.project.dateEstimated) ).toBeTruthy();
            $httpBackend.flush();
        });

        it('should display the date picker', () => {
            $httpBackend.flush();

            scope.openDatePicker( $.Event('click') );
            expect(scope.isDatePickerOpened).toBeTruthy();
        });

    });


    describe('ProjectsViewController', () => {
        var scope, ctrl, $httpBackend;
        var routeParams = { id: 1 };
        var projectDetails = stubs.projectsList[0];

        beforeEach(inject((_$httpBackend_, $rootScope, $controller) => {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET(config.getApiUrl() + 'projects/1').respond( projectDetails );

            scope = $rootScope.$new();
            ctrl = $controller('ProjectsViewController', {$scope: scope, $routeParams : routeParams});
        }));


        it('should view a project', () => {
            $httpBackend.flush();

            expect(scope.project.name).toEqual(projectDetails.name );
        });

    });

});
