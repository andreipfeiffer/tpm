(function() {

    'use strict';

    TPM.directive('clientSelect', function() {
        return {
            restrict: 'E',
            // require: '^ngModel',
            template: '<select ng-model="project.idClient" ng-options="client.id as client.name for client in clientsList" ng-hide="isNewClient" class="form-control"><option value="">No client, Personal project</option></select>'
        };
    });

    TPM.directive('setFocus', function(){
        return {
            restrict: 'A',
            link: function(scope, element){
                var $elem = $(element[0]);

                // attempt to set focus
                $elem.focus();

                // need this second attempt for modals
                if ( !$elem.is(':focus') ) {
                    setTimeout( function() {
                        $elem.focus();
                    }, 50);
                }

            }
        };
    });

    TPM.directive('ngReallyClick', ['$modal', '$parse', function($modal, $parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {

                var modalInstance, clickHandler;

                element.bind('click', function() {
                    modalInstance = $modal.open({
                        templateUrl: 'views/modal-confirm.html',
                        controller: function ($scope) {
                            $scope.message = attrs.ngReallyMessage;
                        }
                    });

                    modalInstance.result.then(function () {
                        // close callback
                    },function () {
                        // dismiss callback

                        clickHandler = $parse(attrs.ngReallyClick);
                        // Run the function returned by $parse.
                        // It needs the scope object to operate properly.
                        clickHandler(scope);
                    });
                });
            }
        };
    }]);

}());
