(function() {

    'use strict';

    angular.module('TPM.Filters', [])

        .filter('filterByProjectStatus', function() {
            return function(arr, status) {

                if ( !angular.isArray(arr) ) {
                    return [];
                }

                var _status = status.trim();

                // create an array with all active statuses
                var activeStatusList = [
                    TPM.projectsStatusList[0],
                    TPM.projectsStatusList[1]
                ];

                return arr.filter(function(item) {
                    return (function() {
                        if (_status.length) {
                            // if we pass a specific filter
                            return (item.status === _status);
                        } else {
                            // if we don't pass specific filter
                            // return only the active statuses
                            return (activeStatusList.indexOf(item.status) > -1);
                        }
                    })();
                });
            };
        });

}());
