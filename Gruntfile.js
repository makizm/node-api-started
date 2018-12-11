module.exports = function(grunt) {
    grunt.initConfig({
        copy: {
            main: {
                expand: true,
                cwd: 'app/',
                src: 'static/*',
                dest: 'build/',
            },
            sso: { 
                expand: true,
                cwd: 'app/static/sso',
                src: '**/*',
                dest: 'build/static/sso/',
                filter: 'isFile',
            },
        },
    })
    grunt.loadNpmTasks('grunt-contrib-copy')
}
