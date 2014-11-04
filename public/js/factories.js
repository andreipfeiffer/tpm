(function() {

    'use strict';

    angular.module('TPM.Factories', [])
        .factory('tpmCache', function($cacheFactory) {
            return $cacheFactory('tpmCache');
        });

}());
