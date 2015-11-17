(function() {

    'use strict';

    angular.module('TPM.StatusControllers', [])

        .controller('StatusController', [
            '$scope',
            'feedback',
            'websocket',
            function($scope, feedback, websocket) {

                $scope.isLoading = true;
                $scope.status = {
                    users   : 0,
                    projects: 0,
                    income  : 0
                };

                feedback.load();

                // @todo without these, the event handles get added
                // everytime I visit the url / init the controller
                websocket.removeAllListeners('status.data');
                websocket.removeAllListeners('error');

                websocket.emit('status.get', {});

                // @toso could have the listeners added only once, at run-time
                websocket.on('status.data', function (data) {
                    feedback.dismiss();
                    updateData( data );
                    $scope.isLoading = false;
                });

                function updateData(data) {
                    Object.keys( data ).forEach(function(prop) {
                        if ( typeof $scope.status[prop] !== 'undefined' ) {
                            $scope.status[prop] = data[prop];
                        }
                    });
                }
            }
        ]);

}());
