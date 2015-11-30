import 'angular';
import 'angular-mocks';
import 'public/js/app';
import config from 'public/js/appConfig';
import customMatchers from 'public/spec/_matchers';
import stubs from 'public/spec/_stubs';

var fakeModal = {
    result: {
        then: (confirmCallback, cancelCallback) => {
            // Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
            // this.confirmCallBack = confirmCallback;
            // this.cancelCallback  = cancelCallback;
            confirmCallback();
        }
    },
    opened: {
        then: (confirmCallback) => {
            // this.confirmCallBack = confirmCallback;
            confirmCallback();
        }
    },
    close(item) {
        //The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
        // this.result.confirmCallBack( item );
    },
    dismiss(type) {
        //The user clicked cancel on the modal dialog, call the stored cancel callback
        // this.result.cancelCallback( type );
    }
};

describe('Clients Controllers', () => {

    beforeEach(angular.mock.module('tpm'));

    describe('ClientsListController', () => {
        var scope, ctrl, $httpBackend, $modal;

        beforeEach(inject((_$httpBackend_, $rootScope, $controller, $uibModal) => {
            $modal       = $uibModal;
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

            expect(scope.clientsList[0]).toEqual( newClientData );
        });

        it('should delete a client', () => {
            $httpBackend.flush();

            scope.deleteClient( stubs.clientsList[0].id );
            expect(scope.clientsList.length).toEqual( stubs.clientsList.length - 1 );
        });

        it('should open the edit modal, when id is truthy', () => {
            $httpBackend.flush();

            spyOn($modal, 'open').and.returnValue(fakeModal);
            spyOn(scope, 'editClient').and.callFake(() => {});

            scope.openEditDialog( 1 );
            expect( scope.editClient ).toHaveBeenCalled();
        });

        it('should not open the edit modal, when id is 0', () => {
            $httpBackend.flush();

            spyOn($modal, 'open').and.returnValue(fakeModal);
            spyOn(scope, 'editClient').and.callFake(() => {});

            scope.openEditDialog( 0 );
            expect( scope.editClient ).not.toHaveBeenCalled();
        });

    });
});
