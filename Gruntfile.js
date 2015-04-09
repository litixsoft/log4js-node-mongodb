'use strict';

module.exports = function (grunt) {
    // load grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        jshintFiles: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
        clean: {
            jasmine: ['build/jasmine'],
            reports: ['build/reports'],
            coverage: ['build/coverage']
        },
        jshint: {
            options: {
                jshintrc: true
            },
            test: '<%= jshintFiles %>',
            jslint: {
                options: {
                    reporter: 'jslint',
                    reporterOutput: 'build/reports/jshint.xml'
                },
                files: {
                    src: '<%= jshintFiles %>'
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: 'build/reports/jshint_checkstyle.xml'
                },
                files: {
                    src: '<%= jshintFiles %>'
                }
            }
        },
        bgShell: {
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir build/coverage node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root build/coverage --dir build/coverage/cobertura cobertura'
            }
        },
        open: {
            file: {
                path: 'build/coverage/lcov-report/index.html'
            }
        },
        jasmine_node: {
            options: {
                forceExit: true,
                match: '.',
                matchall: false,
                extensions: 'js',
                specNameMatcher: 'spec',
                requirejs: false
            },
            unit: ['test/'],
            ci: {
                options: {
                    jUnit: {
                        report: true,
                        savePath: 'build/jasmine/',
                        useDotNotation: true,
                        consolidate: true
                    }
                },
                src: ['test/']
            }

            //specNameMatcher: './*.spec', // load only specs containing specNameMatcher
            //projectRoot: 'test',
            //requirejs: false,
            //forceExit: true,
            //jUnit: {
            //    report: true,
            //    savePath: 'build/jasmine/',
            //    useDotNotation: true,
            //    consolidate: true
            //}
        }
    });

    // Register tasks.
    grunt.registerTask('test', ['clean:jasmine', 'jshint:test', 'jasmine_node:unit']);
    grunt.registerTask('cover', ['clean:coverage', 'jshint:test', 'bgShell:coverage', 'open']);
    grunt.registerTask('ci', ['clean', 'jshint:jslint', 'jshint:checkstyle', 'bgShell:coverage', 'bgShell:cobertura', 'jasmine_node:unit', 'jasmine_node:ci']);

    // Default task.
    grunt.registerTask('default', ['test']);
};