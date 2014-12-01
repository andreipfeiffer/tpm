/*jshint scripturl: true, camelcase: false*/

module.exports = function(grunt) {

    'use strict';

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'), // the package file to use

        karma: {
            unit:  { configFile: 'karma.conf.js', keepalive: true },
            // e2e:   { configFile: 'test/config/e2e.js', keepalive: true },
            // watch: { configFile: 'test/config/unit.js', singleRun:false, autoWatch: true, keepalive: true }
        },

        protractor: {
            options: {
                keepAlive: false,
                configFile: 'protractor.conf.js',
                noColor: false
            },
            run: {}
        },

        jshint: {
            files: [
                '*.js',
                'server/**/*.js',
                'public/js/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                ignores: [
                    'public/js/libs/*.js'
                ]
            }
        },

        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*\n<%= pkg.name %> v<%= pkg.version %> \n \nLast update: <%= grunt.template.date() %> \nAuthor: <%= pkg.author.name %> (<%= pkg.author.url %>)\n<%= pkg.repository.url %>\n*/\n',
                sourceMap: 'src/source-map.js',
                report: 'gzip'
            },
            dist: {
                files: {
                    'src/<%= pkg.name %>-<%= pkg.version %>.min.js': ['src/jquery.esoh-lift.js']
                }
            }
        },

        /*mochacli: {
            options: {
                reporter: 'spec',
                ui: 'tdd'
            },
            all: ['server/test/*Test.js']
        },*/

        mocha_istanbul: {
            coverage: {
                src: ['server/test/*Test.js'],
                options: {
                    coverageFolder: 'coverage/server',
                    reportFormats: ['text', 'html']
                }
            }
        },

        // watch: {
        //     files: ['src/*.js', 'spec/*.js', 'css/*.css'],
        //     tasks: ['jshint', 'csslint'],
        // },
    });

    grunt.registerTask('default', [
        'jshint', 'mocha_istanbul', 'karma'
    ]);

    // run this first:
    // node node_modules/protractor/bin/webdriver-manager start
    // to update run:
    // node node_modules/protractor/bin/webdriver-manager update
    grunt.registerTask('e2e', [
        'protractor'
    ]);
};