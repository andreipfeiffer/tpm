/*jshint scripturl: true, camelcase: false*/

module.exports = (grunt) => {

    'use strict';

    const DIST_PROD_URL = 'dist/prod';
    const DIST_DEV_URL  = 'dist/dev';

    var packageData = grunt.file.readJSON('package.json');

    require('matchdep').filterDev('grunt-*').forEach( grunt.loadNpmTasks );
    require('matchdep').filter('grunt-*').forEach( grunt.loadNpmTasks );
    grunt.loadTasks('tasks');

    grunt.initConfig({

        pkg    : packageData,
        distUrl: {
            prod: DIST_PROD_URL,
            dev : DIST_DEV_URL
        },

        karma: {
            unit:  { configFile: 'karma.conf.js', keepalive: true },
            // e2e:   { configFile: 'test/config/e2e.js', keepalive: true },
            // watch: { configFile: 'test/config/unit.js', singleRun:false, autoWatch: true, keepalive: true }
        },

        protractor: {
            options: {
                keepAlive: false,
                noColor  : false
            },
            e2e: {
                configFile: 'protractor.conf.js'
            },
            bdd: {
                configFile: 'protractor.conf.bdd.js'
            }
        },

        jshint: {
            files: [
                '*.js',
                'server/**/*.js',
                'public/**/*.js',
                '!public/bower_components/**'
            ],
            options: {
                jshintrc: '.jshintrc',
                ignores : [
                    'public/js/libs/*.js',
                    'public/spec-e2e/*'
                ]
            }
        },

        mocha_istanbul: {
            coverage: {
                src    : ['server/test/*Test.js'],
                options: {
                    coverageFolder: 'coverage/server',
                    reportFormats : ['text', 'html']
                }
            }
        },

        jade: {
            compile: {
                options: {
                    pretty: true,
                    data  : packageData
                },
                files: {
                    'temp/index.html': ['public/index.jade']
                }
            }
        },

        dom_munger: {
            css: {
                options: {
                    read: [{
                        selector : 'link',
                        attribute: 'href',
                        writeto  : 'cssRefs',
                        isPath   : false
                    }],
                    remove: ['link'],
                    append: [{ selector: 'head', html: '<link href="<%= distUrl.prod %>/css/<%= pkg.name %>-<%= pkg.version %>.css" rel="stylesheet">' }]
                },
                // overwrite file
                src: 'temp/index.html'
            },
            /*js: {
                options: {
                    read: [{
                        selector : 'script',
                        attribute: 'src',
                        writeto  : 'jsRefs',
                        isPath   : false
                    }],
                    remove: ['script'],
                    append: [{ selector: 'body', html: '<script src="<%= distUrl.prod %>/js/<%= pkg.name %>-<%= pkg.version %>.js"></script>' }]
                },
                // overwrite file
                src: 'temp/index.html'
            },*/
        },

        concat: {
            css: {
                src : '<%= resources.css %>',
                dest:'temp/style.css'
            },
            /*js: {
                src : '<%= resources.js %>',
                dest:'temp/script.js'
            }*/
        },

        cssmin: {
            build: {
                options: {
                    banner: '/*\n<%= pkg.name %> v<%= pkg.version %> \n \nLast update: <%= grunt.template.date() %> \nAuthor: <%= pkg.author.name %> (<%= pkg.author.url %>)\n<%= pkg.repository.url %>\n*/\n',
                    report: 'gzip',
                    keepSpecialComments: 0
                },
                files: {
                    '<%= distUrl.prod %>/css/<%= pkg.name %>-<%= pkg.version %>.css': ['temp/style.css']
                }
            }
        },

        htmlmin: {
            build: {
                options: {
                    removeComments    : true,
                    collapseWhitespace: true,
                    preserveLineBreaks: true
                },
                files: {
                    '<%= distUrl.prod %>/index.html': 'temp/index.html'
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
                    '<%= distUrl.prod %>/js/<%= pkg.name %>-<%= pkg.version %>.js': ['temp/script.js']
                }
            }
        },

        copy: {
            fonts: {
                expand : true,
                cwd    : 'public/bower_components/bootstrap/dist/fonts/',
                src    : '**',
                dest   : '<%= distUrl.prod %>/fonts/',
                flatten: true,
                filter : 'isFile'
            }
        },

        clean: {
            dist: [DIST_PROD_URL],
            temp: ['temp']
        },

        babel: {
            client: {
                files: [{
                    expand: true,
                    cwd   : './public/js/',
                    src   : ['**/*.js'],
                    dest  : DIST_DEV_URL + '/js',
                    ext   : '.js'
                }]
            }
        },

        exec: {
            checkout: {
                cmd: (version) => {
                    return 'git checkout ' + version;
                }
            },
            npm     : {
                cmd   : 'npm install --production',
                stderr: false
            },
            bower   : 'bower install --production',
            build   : 'grunt build',
            restart : 'sudo service upsidedown.ro.tpm restart'
        },

        watch: {
            scripts: {
                files: ['public/**/*.js', 'spec/**/*.js'],
                tasks: ['babel'],
            }
        },

        plato: {
            report: {
                options : {
                    jshint : false
                },
                files: {
                    'reports/plato': ['public/js/**/*.js']
                }
            }
        },
    });

    grunt.registerTask('default', [
        'jshint', 'mocha_istanbul', 'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'jade',
        'dom_munger:css',
        'fix_public_path',
        'babel',
        'concat:css',
        // 'concat:js',
        'htmlmin',
        'cssmin',
        // 'uglify',
        'copy',
        'clean:temp'
    ]);

    grunt.registerTask('e2e', [
        'protractor:e2e'
    ]);

    grunt.registerTask('bdd', [
        'protractor:bdd'
    ]);

    grunt.registerTask('test', [
        'jshint',
        'karma',
        'mocha_istanbul',
        'protractor:bdd'
    ]);

    grunt.registerTask('deploy', 'Deploy bulk commands', version => {
        if ( version ) {
            grunt.log.writeln('Deploying v' + version);
            grunt.task.run('exec:checkout:' + version);
        }
        grunt.task.run([
            'exec:npm',
            'exec:bower',
            'exec:build',
            'exec:restart'
        ]);
    });
};
