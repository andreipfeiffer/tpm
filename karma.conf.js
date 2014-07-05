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
            '../bower_components/angular/angular.min.js',
            '../bower_components/bootstrap/dist/js/bootstrap.min.js',

            // vendor helpers
            '../bower_components/angular-mocks/angular-mocks.js',

            // app
            'js/app.js',

            // tests
            'spec/*Spec.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        preprocessors: {
            'js/app.js': 'coverage',
        },
        coverageReporter: {
            type : 'text',
            dir : 'coverage/'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['dots', 'coverage'],

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
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false

    });
};