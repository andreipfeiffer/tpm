/*jshint scripturl: true*/

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

        jshint: {
            files: [
                'Gruntfile.js',
                'js/*.js',
                'spec/*.js',
            ],
            options: {
                jshintrc: '.jshintrc',
                ignores: [
                    'src/*.min.js',
                    'src/*map.js'
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

        watch: {
            files: ['src/*.js', 'spec/*.js', 'css/*.css'],
            tasks: ['jshint', 'csslint'],
        },
    });

    grunt.registerTask('default', [
        'karma'
    ]);
};