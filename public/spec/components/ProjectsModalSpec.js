import 'angular';
import 'angular-mocks';
import 'public/js/app';

describe('ProjectsModal', () => {

    const MODAL_TITLE = 'projects modal title';
    var ProjectsModal, $modal, $httpBackend;

    beforeEach(angular.mock.module('tpm'));

    beforeEach(inject((_$httpBackend_, _ProjectsModal_, $uibModal) => {
        ProjectsModal = _ProjectsModal_;
        $httpBackend  = _$httpBackend_;
        $modal        = $uibModal;

        // stub the template
        $httpBackend.whenGET(/views\//).respond('<h3 class="modal-title">{{title}}</h3>');
    }));


    it('should open ProjectsModal', () => {
        ProjectsModal.open(MODAL_TITLE, [], false);
        $httpBackend.flush();

        expect( $('.modal-title').text() ).toBe( MODAL_TITLE );
    });

});
