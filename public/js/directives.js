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
                // don't exactly understand why we need this timeout
                // maybe because of the animation of the modal
                setTimeout( function() {
                    element[0].focus();
                }, 50);

            }
        };
    });

}());




