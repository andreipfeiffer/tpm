import 'angular';
import 'angular-mocks';
import 'public/js/app';
import config from 'public/js/appConfig';
import customMatchers from 'public/spec/_matchers';
import stubs from 'public/spec/_stubs';

describe('Clients Controllers', () => {

    beforeEach(angular.mock.module('tpm'));

    describe('ClientsListController', () => {
        var scope, ctrl, $httpBackend;

        beforeEach(inject((_$httpBackend_, $rootScope, $controller) => {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET(config.getApiUrl() + 'clients').respond( stubs.clientsList );
            $httpBackend.whenGET(/views\//).respond(200);

            scope = $rootScope.$new();
            ctrl = $controller('ClientsListController', {$scope: scope});

            // stub the form methods
            scope.clientsForm = {
                $setPristine() {}
            };

            jasmine.addMatchers( customMatchers );
        }));


        it('should set the response from the API to $scope.clientsList', () => {
            expect(scope.clientsList).toBeUndefined();
            $httpBackend.flush();

            expect(scope.clientsList).toEqualDeep( stubs.clientsList );
        });

        it('should toggle the New Client form', () => {
            $httpBackend.flush();

            expect(scope.isFormNewDisplayed).toBe(false);
            scope.toggleNewFormDisplay();
            expect(scope.isFormNewDisplayed).toBe(true);
        });

        it('should add a new client', () => {
            $httpBackend.flush();

            scope.toggleNewFormDisplay();
            scope.newClient.name = 'New client';

            $httpBackend.expectPOST(config.getApiUrl() + 'clients').respond(201);
            scope.addNewClient();
            $httpBackend.flush();

            expect(scope.clientsList.length).toBe( stubs.clientsList.length + 1 );
            expect(scope.newClient.name).toBe('');
        });

        it('should edit a client', () => {
            var client = stubs.clientsList[0];
            $httpBackend.flush();

            var newClientData = Object.assign( {}, client );
            newClientData.name = 'Edited client name';

            $httpBackend.expectPUT(config.getApiUrl() + 'clients/' + client.id).respond(200);
            scope.editClient( newClientData );
            $httpBackend.flush();

            expect(scope.clientsList[0]).toEqualDeep( newClientData );
        });

        it('should delete a client', () => {
            $httpBackend.flush();

            scope.deleteClient( stubs.clientsList[0].id );
            expect(scope.clientsList.length).toEqual( stubs.clientsList.length - 1 );
        });

    });
});
