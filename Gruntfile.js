/*jshint scripturl: true, camelcase: false*/

module.exports = function(grunt) {

    'use strict';

    var packageData = grunt.file.readJSON('package.json');

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.loadTasks('tasks');

    grunt.initConfig({

        pkg: packageData, // the package file to use

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

        jade: {
            compile: {
                options: {
                    pretty: true,
                    data: packageData
                },
                files: {
                    'temp/index.html': ['public/index.jade']
                }
            }
        },

        dom_munger: {
            build: {
                options: {
                    read: [
                        {
                            selector: 'script',
                            attribute: 'src',
                            writeto: 'jsRefs',
                            isPath: false
                        },
                        {
                            selector: 'link',
                            attribute: 'href',
                            writeto: 'cssRefs',
                            isPath: false
                        }
                    ],
                    remove: ['link','script'],
                    append: [
                        { selector:'head', html:'<link href="dist/css/<%= pkg.name %>-<%= pkg.version %>.css" rel="stylesheet">' },
                        { selector: 'body', html: '<script src="dist/js/<%= pkg.name %>-<%= pkg.version %>.js"></script>' }
                    ]
                },
                // overwrite file
                src: 'temp/index.html'
            },
        },

        concat: {
            css: {
                src: '<%= resources.css %>',
                dest:'temp/style.css'
            },
            js: {
                src: '<%= resources.js %>',
                dest:'temp/script.js'
            }
        },

        cssmin: {
            build: {
                options: {
                    banner: '/*\n<%= pkg.name %> v<%= pkg.version %> \n \nLast update: <%= grunt.template.date() %> \nAuthor: <%= pkg.author.name %> (<%= pkg.author.url %>)\n<%= pkg.repository.url %>\n*/\n',
                    report: 'gzip',
                    keepSpecialComments: 0
                },
                files: {
                    'dist/css/<%= pkg.name %>-<%= pkg.version %>.css': ['temp/style.css']
                }
            }
        },

        htmlmin: {
            build: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    preserveLineBreaks: true
                },
                files: {
                    'dist/index.html': 'temp/index.html'
                }
            }
        },

        uglify: {
            build: {
                options: {
                    banner: '/*\n<%= pkg.name %> v<%= pkg.version %> \n \nLast update: <%= grunt.template.date() %> \nAuthor: <%= pkg.author.name %> (<%= pkg.author.url %>)\n<%= pkg.repository.url %>\n*/\n',
                    report: 'gzip',
                    mangle: false
                },
                files: {
                    'dist/js/<%= pkg.name %>-<%= pkg.version %>.js': ['temp/script.js']
                }
            }
        },

        copy: {
            fonts: {
                expand: true,
                cwd: 'bower_components/bootstrap/dist/fonts/',
                src: '**',
                dest: 'dist/fonts/',
                flatten: true,
                filter: 'isFile'
            }
        },

        clean: {
            dist: ['dist'],
            temp: ['temp']
        },

        // watch: {
        //     files: ['src/*.js', 'spec/*.js', 'css/*.css'],
        //     tasks: ['jshint', 'csslint'],
        // },
    });

    grunt.registerTask('default', [
        'jshint', 'mocha_istanbul', 'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'jade',
        'dom_munger',
        'fix_public_path',
        'concat',
        'htmlmin',
        'cssmin',
        'uglify',
        'copy',
        'clean:temp'
    ]);

    // run this first:
    // node node_modules/protractor/bin/webdriver-manager start
    // to update run:
    // node node_modules/protractor/bin/webdriver-manager update
    grunt.registerTask('e2e', [
        'protractor'
    ]);
};