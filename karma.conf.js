// Karma configuration
module.exports = function(config) {

    'use strict';

    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: './public',

        // frameworks to use
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            // vendors
            '../bower_components/jquery/dist/jquery.min.js',
            '../bower_components/bootstrap/dist/js/bootstrap.min.js',
            '../bower_components/angular/angular.min.js',
            '../bower_components/angular-route/angular-route.min.js',
            '../bower_components/angular-resource/angular-resource.min.js',
            '../bower_components/angular-bootstrap/ui-bootstrap.min.js',
            '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            '../bower_components/moment/min/moment.min.js',
            '../bower_components/angular-ui-validate/dist/validate.js',
            '../bower_components/angular-touch/angular-touch.min.js',
            '../bower_components/angular-media-queries/match-media.js',
            '../bower_components/angular-feedback/dist/feedback.min.js',
            '../bower_components/angular-animate/angular-animate.min.js',
            '../bower_components/Chart.js/Chart.min.js',
            '../bower_components/angular-chart.js/dist/angular-chart.min.js',
            '../bower_components/socket.io-client/socket.io.js',
            '../bower_components/angular-socket-io/socket.js',

            // vendor helpers
            '../bower_components/angular-mocks/angular-mocks.js',
            '../bower_components/angular-socket.io-mock/angular-socket.io-mock.js',

            // app
            'js/app.js',
            'js/**/*.js',

            // test utils
            'spec/_*.js',
            // test specs
            'spec/*Spec.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        preprocessors: {
            'js/**/*.js': 'coverage',
        },
        coverageReporter: {
            dir : '../coverage/client/',
            reporters: [
                { type: 'text' },
                { type: 'html', subdir: 'html' },
                // { type: 'lcov', subdir: 'lcov' },
            ]
        },

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['mocha', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 10000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false

    });
};