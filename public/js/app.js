import angular from 'angular';
import 'angular-touch';
import 'angular-animate';
import 'angular-socket-io';
import 'angular-feedback';
import 'angular-resource';
import 'angular-media-queries';
import 'angular-bootstrap';
import 'angular-bootstrap-tpls';
import 'angular-ui-validate';
import 'angular-chart';

import 'public/js/directives';
import 'public/js/factories';
import 'public/js/services';
import 'public/js/interceptors';
import 'public/js/filters';
import 'public/js/controllers/authControllers';
import 'public/js/controllers/headerControllers';
import 'public/js/controllers/statusControllers';
import 'public/js/controllers/projectsControllers';
import 'public/js/controllers/clientsControllers';
import 'public/js/controllers/reportsControllers';
import 'public/js/controllers/settingsControllers';

import {appInit} from 'public/js/appInit';

var app = angular.module('tpm', [
    'ngRoute',
    'ngTouch',
    'ngAnimate',

    'TPM.Directives',
    'TPM.Services',
    'TPM.Factories',
    'TPM.Interceptors',
    'TPM.Filters',
    'TPM.AuthControllers',
    'TPM.HeaderControllers',
    'TPM.StatusControllers',
    'TPM.ProjectsControllers',
    'TPM.ClientsControllers',
    'TPM.ReportsControllers',
    'TPM.SettingsControllers',

    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'ui.validate',
    'feedback',
    'matchMedia',
    'btford.socket-io',
    'chart.js',

    appInit.name
]).run();

export default app;
