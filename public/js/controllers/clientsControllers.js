(function() {

    'use strict';

    angular.module('clientsControllers', [])

        .controller('ClientsListController', [
            '$scope',
            'Clients',
            function($scope, Clients) {

                $scope.clientsList = Clients.query();

            }
        ])

}());