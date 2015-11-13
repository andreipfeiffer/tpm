(function() {

    'use strict';

    angular.module('TPM.Services', ['ngResource'])

        .factory('ProjectsService', ['$http', '$resource', function($http, $resource) {
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

        .factory('ProjectsClientService', ['$http', '$resource', function($http, $resource) {
            return $resource(
                TPM.apiUrl + 'projects/client/:id',
                {
                    id: '@id'
                }
            );
        }])

        .factory('ProjectsModal', ['$uibModal', 'SettingsUser', function($modal, SettingsUser) {
            function ModalProjectsCtrl($scope, $uibModalInstance, data) {
                $scope.data          = angular.extend({}, data.list);
                $scope.title         = data.title;
                $scope.detailedPrice = data.detailedPrice;
                $scope.currency      = data.currency;
            }

            function open(title, list, detailedPrice) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/reports-show-projects.html',
                    controller : ModalProjectsCtrl,
                    resolve    : {
                        data : function() {
                            return {
                                list         : list,
                                title        : title,
                                currency     : SettingsUser.get().currency,
                                detailedPrice: detailedPrice
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

        .factory('ClientsService', ['$resource', function($resource) {
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

        .factory('SettingsService', ['$resource', function($resource) {
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

        .factory('ReportsService', ['$resource', function($resource) {
            return $resource(
                TPM.apiUrl + 'reports'
            );
        }])

        .service('SettingsUser', function($http) {
            var defaults = {
                currency: TPM.utils.currencyList[0]
            };

            this.fetch = function() {
                return $http.get(TPM.apiUrl + 'settings/user');
            };

            this.set = function(data) {
                var _settings = angular.extend( {}, defaults, data );
                localStorage.setItem('TPMsettings', JSON.stringify( _settings ));
            };

            this.get = function() {
                var settings = JSON.parse( localStorage.getItem('TPMsettings') );
                if ( !settings ) {
                    settings = angular.extend( {}, defaults );
                }
                return settings;
            };

            this.remove = function() {
                return localStorage.removeItem('TPMsettings');
            };
        })

        .service('SessionService', function($http) {

            this.setAuthToken = function(token) {
                localStorage.setItem('TPMtoken', token);
                $http.defaults.headers.common['Authorization'] = token;
            };

            this.getAuthToken = function() {
                return localStorage.getItem('TPMtoken');
            };

            this.removeAuthToken = function() {
                return localStorage.removeItem('TPMtoken');
            };
        });

}());
