// Karma configuration
module.exports = function(config) {

    'use strict';

    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: './',

        // frameworks to use
        frameworks: ['systemjs', 'jasmine'],

        // list of files / patterns to load in the browser
        files: [
            // needed to polyfill some features like Array.prototype.[new-stuff]
            'node_modules/babel-polyfill/dist/polyfill.js',

            // test specs
            'public/spec/*.js',
            'public/spec/**/*.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        plugins: [
            'karma-systemjs',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-safari-launcher',
            'karma-babel-preprocessor',
            'karma-jasmine',
            'karma-coverage',
            'karma-mocha-reporter'
        ],

        preprocessors: {
            'public/js/**/*.js'  : ['babel', 'coverage'],
            'public/spec/**/*.js': ['babel']
        },

        coverageReporter: {
            // configure the reporter to use isparta for JavaScript coverage
            // Only on { "karma-coverage": "douglasduteil/karma-coverage#next" }
            instrumenters: {
                isparta : require('isparta')
            },
            instrumenter: {
                'public/js/**/*.js': 'isparta'
            },
            dir: 'coverage/client/',
            reporters: [
                { type: 'text' },
                { type: 'text-summary' },
                { type: 'html', subdir: 'html' },
                // { type: 'lcov', subdir: 'lcov' },
            ]
        },

        babelPreprocessor: {
            options: {
                presets  : ['es2015'],
                sourceMap: 'inline'
            }
        },

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['mocha', 'coverage'],

        systemjs: {
            configFile: 'public/system.config.js',
            serveFiles: [
                'public/bower_components/jquery/dist/jquery.js',
                'public/bower_components/angular/angular.js',
                'public/bower_components/angular-route/angular-route.js',
                'public/bower_components/angular-touch/angular-touch.js',
                'public/bower_components/angular-animate/angular-animate.js',
                'public/bower_components/angular-resource/angular-resource.js',
                'public/bower_components/angular-feedback/src/scripts/feedback.js',
                'public/bower_components/angular-media-queries/match-media.js',
                'public/bower_components/bootstrap/dist/js/bootstrap.js',
                'public/bower_components/angular-bootstrap/ui-bootstrap.js',
                'public/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/bower_components/angular-ui-validate/dist/validate.js',
                'public/bower_components/moment/moment.js',
                'public/bower_components/socket.io-client/socket.io.js',
                'public/bower_components/angular-socket-io/socket.js',
                'public/bower_components/Chart.js/Chart.min.js',
                'public/bower_components/angular-chart.js/dist/angular-chart.min.js',

                'public/bower_components/angular-mocks/angular-mocks.js',
                'public/bower_components/angular-socket.io-mock/angular-socket.io-mock.js',

                'public/js/**/*.js'
            ],

            // SystemJS configuration specifically for tests, added after your config file.
            // Good for adding test libraries and mock modules
            config: {
                paths: {
                    'angular-mocks'         : 'public/bower_components/angular-mocks/angular-mocks.js',
                    'angular-socket-io-mock': 'public/bower_components/angular-socket.io-mock/angular-socket.io-mock.js',

                    'babel'                 : 'node_modules/babel-core/browser.js',
                    'systemjs'              : 'node_modules/systemjs/dist/system.js',
                    'system-polyfills'      : 'node_modules/systemjs/dist/system-polyfills.js',
                    'es6-module-loader'     : 'node_modules/es6-module-loader/dist/es6-module-loader.js',
                    'phantomjs-polyfill'    : 'node_modules/phantomjs-polyfill/bind-polyfill.js',
                }
            }
        },

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
        browsers: ['PhantomJS'/*, 'Chrome', 'Firefox', 'Safari'*/],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 10000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false

    });
};