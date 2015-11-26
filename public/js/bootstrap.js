import angular from 'angular';
import tpm from 'main';

angular.element(document).ready(function() {
    angular.bootstrap(document.querySelector('[data-main-app]'), [
        tpm.name
    ], {
        strictDi: true
    });
});
