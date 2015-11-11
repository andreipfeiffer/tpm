(function() {

    'use strict';

    angular.module('TPM.Filters', [])

        .filter('filterByProjectStatus', function() {
            return function(arr, status) {

                if ( !angular.isArray(arr) ) {
                    return [];
                }

                var _status = status.trim();

                return arr.filter(function(item) {
                    return (function() {
                        if (_status.length) {
                            // if we pass a specific filter
                            return (item.status === _status);
                        } else {
                            // if we don't pass specific filter
                            // return only the active statuses
                            return (TPM.utils.getActiveStatusList().indexOf(item.status) > -1);
                        }
                    })();
                });
            };
        })

        .filter('filterByClientId', function() {
            return function(arr, id) {

                if ( !angular.isArray(arr) ) {
                    return [];
                }

                return arr.filter(function(item) {
                    return (function() {
                        // default value, when no filter is seleted, the value is ""
                        // when the filter is cleared, the value is null
                        if ( id === null || id === '' ) {
                            return true;
                        } else {
                            return (parseInt(item.idClient) === parseInt(id));
                        }
                    })();
                });
            };
        });

}());
