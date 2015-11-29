import angular from 'angular';
import app from 'public/js/app';

angular.element(document).ready(() => {
    angular.bootstrap(document.querySelector('[data-main-app]'), [
        app.name
    ], {
        strictDi: true
    });
});
