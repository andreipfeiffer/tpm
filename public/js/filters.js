(function() {

    'use strict';

    angular.module('TPM.Filters', [])

        .filter('filterByProjectStatus', function() {
            return function(arr, status) {
                if ( !angular.isArray(arr) ) {
                    return [];
                }

                return arr.filter(function(item) {
                    return (item.status === status) || !status;
                });
            };
        });

}());
