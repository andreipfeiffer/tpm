import angular from 'angular';

export default angular.module('TPM.Directives', [])

    .directive('setFocus', function() {
        return {
            restrict: 'A',
            link    : function(scope, element){
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
    })

    .directive('clickConfirm', ['$uibModal', '$parse', function($modal, $parse) {
        return {
            restrict: 'A',
            link    : function(scope, element, attrs) {

                var modalInstance, clickHandler;

                element.bind('click', function() {
                    modalInstance = $modal.open({
                        templateUrl: 'public/views/modal-confirm.html',
                        controller : ['$scope', function($scope) {
                            $scope.message = attrs.clickConfirmMessage;
                        }]
                    });

                    modalInstance.result.then(function () {
                        // close callback
                    },function () {
                        // dismiss callback

                        clickHandler = $parse(attrs.clickConfirm);
                        // Run the function returned by $parse.
                        // It needs the scope object to operate properly.
                        clickHandler(scope);
                    });
                });
            }
        };
    }]);
