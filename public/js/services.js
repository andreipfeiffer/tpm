import angular from 'angular';
import utils from 'public/js/utils';

// @todo extract module
class SessionService {
    constructor($http) {
        this.$http = $http;
    }

    setAuthToken(token) {
        localStorage.setItem('TPMtoken', token);
        this.$http.defaults.headers.common['Authorization'] = token;
    }
    getAuthToken() {
        return localStorage.getItem('TPMtoken');
    }
    removeAuthToken() {
        return localStorage.removeItem('TPMtoken');
    }
}
SessionService.$inject = ['$http'];

// @todo extract module
class SettingsUser {
    constructor($http) {
        this.$http    = $http;
        // @todo use Map()
        this.defaults = {
            currency: utils.currencyList[0]
        };
    }

    fetch() {
        return this.$http.get(TPM.apiUrl + 'settings/user');
    }
    remove() {
        return localStorage.removeItem('TPMsettings');
    }
    set(data) {
        var _settings = Object.assign( {}, this.defaults, data );
        localStorage.setItem('TPMsettings', JSON.stringify( _settings ));
    }
    get() {
        var settings = JSON.parse( localStorage.getItem('TPMsettings') );
        if ( !settings ) {
            settings = Object.assign( {}, this.defaults );
        }
        return settings;
    }
}
SettingsUser.$inject = ['$http'];

export default angular.module('TPM.Services', ['ngResource'])

    .factory('ProjectsService', ['$http', '$resource', ($http, $resource) => {
        return $resource(
            TPM.apiUrl + 'projects/:id',
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
            TPM.apiUrl + 'projects/client/:id',
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
            TPM.apiUrl + 'clients/:id',
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
            TPM.apiUrl + 'settings/:type/:field',
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
            TPM.apiUrl + 'reports'
        );
    }])

    .service('SettingsUser', SettingsUser)
    .service('SessionService',  SessionService);
