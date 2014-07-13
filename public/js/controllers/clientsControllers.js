(function() {

    'use strict';

    angular.module('TPM.ClientsControllers', [])

        .controller('ClientsListController', [
            '$scope',
            'ClientsService',
            function($scope, Clients) {

                $scope.clientsList = Clients.query();

            }
        ])

}());