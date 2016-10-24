class ProjectsModal {
    constructor($modal, SettingsUser) {
        this.$modal       = $modal;
        this.SettingsUser = SettingsUser;
    }
    open(title, list, detailedPrice) {
        var currency = this.SettingsUser.get().currency;

        function ModalProjectsCtrl($scope, $uibModalInstance, data) {
            $scope.data          = Object.assign({}, data.list);
            $scope.title         = data.title;
            $scope.detailedPrice = data.detailedPrice;
            $scope.currency      = data.currency;
        }
        ModalProjectsCtrl.$inject = ['$scope', '$uibModalInstance', 'data'];

        var modalInstance = this.$modal.open({
            animation  : false,
            templateUrl: 'public/views/projects-list-modal.html',
            controller : ModalProjectsCtrl,
            resolve    : {
                data() {
                    return {
                        list,
                        title,
                        currency,
                        detailedPrice
                    };
                }
            }
        });

        return modalInstance;
    }
}
ProjectsModal.$inject = ['$uibModal', 'SettingsUser'];

export default ProjectsModal;
