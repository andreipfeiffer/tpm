(function() {

    'use strict';

    angular.module('TPM.Factories', [])

        .factory('tpmCache', function($cacheFactory) {
            return $cacheFactory('tpmCache');
        })

        .factory('websocket', function (socketFactory) {
            return socketFactory({
                ioSocket: io.connect( TPM.apiUrl )
            });
        });

}());
