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
        'jquery'                : 'public/bower_components/jquery/dist/jquery.min',
        'angular'               : 'public/bower_components/angular/angular.min',
        'angular-route'         : 'public/bower_components/angular-route/angular-route.min',
        'angular-touch'         : 'public/bower_components/angular-touch/angular-touch.min',
        'angular-animate'       : 'public/bower_components/angular-animate/angular-animate.min',
        'angular-resource'      : 'public/bower_components/angular-resource/angular-resource.min',
        'angular-feedback'      : 'public/bower_components/angular-feedback/dist/feedback.min',
        'angular-media-queries' : 'public/bower_components/angular-media-queries/match-media',
        'bootstrap'             : 'public/bower_components/bootstrap/dist/js/bootstrap.min',
        'angular-bootstrap'     : 'public/bower_components/angular-bootstrap/ui-bootstrap.min',
        'angular-bootstrap-tpls': 'public/bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-ui-validate'   : 'public/bower_components/angular-ui-validate/dist/validate.min',
        'moment'                : 'public/bower_components/moment/min/moment.min',
        'socket-io'             : 'public/bower_components/socket.io-client/socket.io',
        'angular-socket-io'     : 'public/bower_components/angular-socket-io/socket.min',
        'chart'                 : 'public/bower_components/Chart.js/Chart.min',
        'angular-chart'         : 'public/bower_components/angular-chart.js/dist/angular-chart.min',
    }
});

