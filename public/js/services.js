import angular from 'angular';
import config from 'public/js/appConfig';
import AuthToken from 'public/js/components/AuthToken';
import SettingsUser from 'public/js/components/SettingsUser';

export default angular.module('TPM.Services', ['ngResource'])

    .factory('ProjectsService', ['$http', '$resource', ($http, $resource) => {
        return $resource(
            config.getApiUrl() + 'projects/:id',
            {
                id: '@id'
            },
            {
                'update': { method:'PUT' }
            }
        );
    }])

    .factory('ProjectsClientService', ['$http', '$resource', ($http, $resource) => {
        return $resource(
            config.getApiUrl() + 'projects/client/:id',
            {
                id: '@id'
            }
        );
    }])

    .factory('ProjectsModal', ['$uibModal', 'SettingsUser', ($modal, SettingsUser) => {

        function ModalProjectsCtrl($scope, $uibModalInstance, data) {
            $scope.data          = Object.assign({}, data.list);
            $scope.title         = data.title;
            $scope.detailedPrice = data.detailedPrice;
            $scope.currency      = data.currency;
        }
        ModalProjectsCtrl.$inject = ['$scope', '$uibModalInstance', 'data'];

        function open(title, list, detailedPrice) {
            var currency      = SettingsUser.get().currency;

            var modalInstance = $modal.open({
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

        return {
            open: open
        };
    }])

    .factory('ClientsService', ['$resource', ($resource) => {
        return $resource(
            config.getApiUrl() + 'clients/:id',
            {
                id: '@id'
            },
            {
                'update': { method:'PUT' }
            }
        );
    }])

    .factory('SettingsService', ['$resource', ($resource) => {
        return $resource(
            config.getApiUrl() + 'settings/:type/:field',
            {
                type: '@type',
                field: '@field'
            },
            {
                'update': { method:'PUT' }
            }
        );
    }])

    .factory('ReportsService', ['$resource', ($resource) => {
        return $resource(
            config.getApiUrl() + 'reports'
        );
    }])

    .service('SettingsUser', SettingsUser)
    .service('AuthToken',  AuthToken);
