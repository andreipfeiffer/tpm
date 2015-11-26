System.config({
    baseURL              : '/js',
    'defaultJSExtensions': true,
    'transpiler'         : 'babel',
    'babelOptions'       : {
        // 'optional': ['runtime', 'optimisation.modules.system']
    },

    meta: {
        '/../../bower_components/angular/angular': { format: 'global', exports: 'angular', deps: ['jquery'] },
        '/../../bower_components/angular-*': { deps: ['angular'] },
        '/../../bower_components/bootstrap/*': { deps: ['jquery'] },
        '/../../bower_components/angular-bootstrap/*': { deps: ['angular', 'bootstrap', 'angular-bootstrap-tpls'] },
        '/../../bower_components/angular-socket*': { deps: ['angular', 'socket-io'] },
        '/../../bower_components/angular-chart*': { deps: ['angular', 'chart'] },
    },

    map: {
        'jquery'                : '/../../bower_components/jquery/dist/jquery',
        'angular'               : '/../../bower_components/angular/angular',
        'angular-route'         : '/../../bower_components/angular-route/angular-route',
        'angular-touch'         : '/../../bower_components/angular-touch/angular-touch',
        'angular-animate'       : '/../../bower_components/angular-animate/angular-animate',
        'angular-resource'      : '/../../bower_components/angular-resource/angular-resource',
        'angular-feedback'      : '/../../bower_components/angular-feedback/src/scripts/feedback',
        'angular-media-queries' : '/../../bower_components/angular-media-queries/match-media',
        'bootstrap'             : '/../../bower_components/bootstrap/dist/js/bootstrap',
        'angular-bootstrap'     : '/../../bower_components/angular-bootstrap/ui-bootstrap',
        'angular-bootstrap-tpls': '/../../bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-ui-validate'   : '/../../bower_components/angular-ui-validate/dist/validate',
        'moment'                : '/../../bower_components/moment/moment',
        'socket-io'             : '/../../bower_components/socket.io-client/socket.io',
        'angular-socket-io'     : '/../../bower_components/angular-socket-io/socket',
        'chart'                 : '/../../bower_components/Chart.js/Chart.min',
        'angular-chart'         : '/../../bower_components/angular-chart.js/dist/angular-chart.min',
    }
});
