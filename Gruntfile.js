module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: pkg,

    'check-online': {
      alipay: {
        options: {
          // status code should be 404
          statusCode: 404,
          server: 'https://a.alipayobjects.com'
        },
        files: [{
          cwd: 'dist',
          src: '**/*',
          filter: 'isFile',
          dest: '<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>'
        }]
      }
    },

    stylus: {
      compile: {
        files: [{
          cwd: 'src',
          src: '**/*.styl',
          expand: true,
          ext: '.css',
          dest: '.build/stylus/'
        }],
        options: {
          compress: false
        }
      }
    },

    transport: {
      stylus: {
        files: [{
          cwd: '.build/stylus',
          src: '**/*',
          filter: 'isFile',
          dest: '.build/src'
        }]
      }
    },

    peaches: {
      complie: {
        options: {
          beautify: false
        },
        files: [{
          cwd: 'dist',
          src: '**/*.css',
          dest: 'dist'
        }]
      }
    }
  });

  if (!grunt.loadGlobalTasks) {
    grunt.log.error("You shouldn't use grunt to run the tasks");
  }

  grunt.loadGlobalTasks('spm-alipay-suite');
  grunt.loadGlobalTasks('spm-build');

  var builder = require('spm-build')
  grunt.util._.merge(grunt.config.data, builder.config)

  grunt.registerTask('build', [
    'spm-install',
    'clean:dist', // delete dist direcotry first

    // build stylus
    'stylus', // src/*.styl -> .build/stylus/*.css
    'transport:stylus', // .build/stylus/*.css -> .build/src/*.css

    // build css
    'transport:spm',  // src/* -> .build/src/*
    'concat:css',   // .build/src/*.css -> .build/dist/*.css

    // build js (must be invoke after css build)
    'transport:css',  // .build/dist/*.css -> .build/src/*.css.js
    'concat:js',  // .build/src/* -> .build/dist/*.js

    // to dist
    'copy:spm',
    'cssmin:css',   // .build/dist/*.css -> dist/*.css
    'peaches',
    'uglify:js',  // .build/dist/*.js -> dist/*.js

    // resource
    'clean:spm', // rm .build
    'spm-newline',

    'check-online'
  ]);
};
