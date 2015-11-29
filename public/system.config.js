System.config({
    baseURL              : '/',
    'defaultJSExtensions': true,
    'transpiler'         : 'babel',
    'babelOptions'       : {
        // 'optional': ['runtime', 'optimisation.modules.system']
    },

    meta: {
        'public/bower_components/angular/angular'    : { format: 'global', exports: 'angular', deps: ['jquery'] },
        'public/bower_components/bootstrap/*'        : { deps: ['jquery'] },
        'public/bower_components/angular-bootstrap/*': { deps: ['angular', 'bootstrap', 'angular-bootstrap-tpls'] },
        'public/bower_components/angular-socket*'    : { deps: ['angular', 'socket-io'] },
        'public/bower_components/angular-chart*'     : { deps: ['angular', 'chart'] },
        'public/bower_components/angular-*'          : { deps: ['angular'] },
    },

    map: {
        'jquery'                : 'public/bower_components/jquery/dist/jquery',
        'angular'               : 'public/bower_components/angular/angular',
        'angular-route'         : 'public/bower_components/angular-route/angular-route',
        'angular-touch'         : 'public/bower_components/angular-touch/angular-touch',
        'angular-animate'       : 'public/bower_components/angular-animate/angular-animate',
        'angular-resource'      : 'public/bower_components/angular-resource/angular-resource',
        'angular-feedback'      : 'public/bower_components/angular-feedback/src/scripts/feedback',
        'angular-media-queries' : 'public/bower_components/angular-media-queries/match-media',
        'bootstrap'             : 'public/bower_components/bootstrap/dist/js/bootstrap',
        'angular-bootstrap'     : 'public/bower_components/angular-bootstrap/ui-bootstrap',
        'angular-bootstrap-tpls': 'public/bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-ui-validate'   : 'public/bower_components/angular-ui-validate/dist/validate',
        'moment'                : 'public/bower_components/moment/moment',
        'socket-io'             : 'public/bower_components/socket.io-client/socket.io',
        'angular-socket-io'     : 'public/bower_components/angular-socket-io/socket',
        'chart'                 : 'public/bower_components/Chart.js/Chart.min',
        'angular-chart'         : 'public/bower_components/angular-chart.js/dist/angular-chart.min',
    }
});

