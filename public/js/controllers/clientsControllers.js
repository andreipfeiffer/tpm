(function() {

    'use strict';

    angular.module('TPM.ClientsControllers', [])

        .controller('ClientsListController', [
            '$scope',
            'Clients',
            function($scope, Clients) {

                $scope.clientsList = Clients.query();

            }
        ])

}());