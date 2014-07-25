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

        .service('ModalAlertService', function($modal, $location) {

            var modalInstance;

            this.open = function (location) {
                modalInstance = $modal.open({
                    templateUrl: 'partials/modal-alert.html'
                });
                modalInstance.result.then(function () {
                    // close callback
                },function () {
                    // dismiss callback
                    $location.path( location );
                });
                return modalInstance;
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
