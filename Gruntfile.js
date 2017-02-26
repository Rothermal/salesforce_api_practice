module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: 'client/scripts/**/*.js'
        },
        watch: {
            client : {
                files: ['client/scripts/**/*.js',
                    'client/views/**/*.html',
                    'client/styles/**/*.scss'
                ],
                tasks: ['jshint', 'uglify','copy','sass'],
                options: {
                    spawn: false
                }
            }
        },
        uglify: {
            build: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'server/public/assets/scripts/client.map'
                },
                src: [
                    'client/scripts/client.js',
                    'client/scripts/controllers/*.js',
                    'client/scripts/factories/*.js'
                ],
                dest: 'server/public/assets/scripts/client.min.js'
            }
        },
        sass: {
            dist: {
                files: {
                    'server/public/assets/styles/style.css': 'client/styles/style.scss'
                }
            }
        },
        copy: {
            Jquery:{
                expand: true,
                cwd: 'node_modules',
                src:[
                    "jquery/dist/jquery.min.js",
                    "jquery/dist/jquery.min.map"
                ],
                "dest": "server/public/assets/vendors"
            },
            html: {
                expand: true,
                cwd: 'client/views/',
                src: [
                    "index.html",
                    "routes/*.html",
                    "partials/*.html",
                    "templates/*.html"
                ],
                "dest": "server/public/assets/views/"
            },
            bootstrap: {
                expand: true,
                cwd: "node_modules/bootstrap/",
                src: [
                    "dist/**/*"
                ],
                "dest": "server/public/assets/vendors/bootstrap/"
            },
            Tether:{
                expand:true,
                cwd:"node_modules/tether/",
                src:[
                    "dist/**/*"
                ],
                "dest":"server/public/assets/vendors/tether/"
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['copy', 'jshint', 'uglify','sass']);
};
