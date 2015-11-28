import angular from 'angular';
import tpm from 'public/js/main';

angular.element(document).ready(function() {
    angular.bootstrap(document.querySelector('[data-main-app]'), [
        tpm.name
    ], {
        strictDi: true
    });
});
