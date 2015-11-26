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

import 'directives';
import 'factories';
import 'services';
import 'interceptors';
import 'filters';
import 'controllers/authControllers';
import 'controllers/headerControllers';
import 'controllers/statusControllers';
import 'controllers/projectsControllers';
import 'controllers/clientsControllers';
import 'controllers/reportsControllers';
import 'controllers/settingsControllers';

import {mainConfigModule} from 'main_config';

var tpm = angular.module('tpm', [
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

    mainConfigModule.name
]).run();

export default tpm;
