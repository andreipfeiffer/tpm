import angular from 'angular';
import io from 'socket-io';
import config from 'public/js/appConfig';

export default angular.module('TPM.Factories', [])

    .factory('tpmCache', ['$cacheFactory', function($cacheFactory) {
        return $cacheFactory('tpmCache');
    }])

    .factory('websocket', ['socketFactory', function(socketFactory) {
        return socketFactory({
            ioSocket: io.connect( config.getApiUrl() )
        });
    }]);
