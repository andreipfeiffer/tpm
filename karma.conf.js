// Karma configuration
module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: './public',

        // frameworks to use
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'js/libs/jquery-1.10.2.min.js',
            'js/libs/bootstrap.min.js',
            'js/libs/handlebars-1.0.0.js',
            'js/libs/ember.js',
            'js/libs/ember-data.js',
            'spec/libs/*.js',
            {
                pattern: 'example/*.html', 
                watch: true, 
                included: false, 
                served: true
            },

            'js/app.js',
            'js/router.js',
            'js/models/*.js',
            'js/controllers/*.js',

            'spec/*Spec.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['coverage'],

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