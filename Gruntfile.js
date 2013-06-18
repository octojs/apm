module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: pkg,

    'check-online': {
      alipay: {
        options: {
          // status code should be 404
          statusCode: 404,
          server: 'https://a.alipayobjects.com',
          onFailure: function() {
            grunt.log.error("Above files is existed online, this version is already published!");
            grunt.file.delete('.build');
            process.exit(0);
          }
        },
        files: [{
          cwd: '.build/dist',
          src: '**/*',
          filter: 'isFile',
          dest: '<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>'
        }]
      }
    },

    'check-debug': {
      dist: {
        options: {
          onFailure: function() {
            grunt.file.delete('.build');
            process.exit(0);
          } 
        },
        files: [{
          cwd: '.build/dist',
          src: '**/*'
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
          cwd: '.build/dist',
          src: '**/*.css',
          dest: '.build/dist'
        }]
      }
    }
  });

  if (!grunt.loadGlobalTasks) {
    grunt.log.error("You shouldn't use grunt to run the tasks");
  }

  grunt.loadGlobalTasks('spm-alipay-suite');

  grunt.loadGlobalTasks('spm-build');

  var builder = require('spm-build');
  grunt.util._.merge(grunt.config.data, builder.config);

  grunt.registerTask('build', [
    'clean:build', // delete build direcotry first

    'spm-install', // install dependencies

    // build stylus
    'stylus', // src/*.styl -> .build/stylus/*.css
    'transport:stylus', // .build/stylus/*.css -> .build/src/*.css

    // build css
    'transport:src',  // src/* -> .build/src/*
    'concat:css',   // .build/src/*.css -> .build/dist/*.css

    // build js (must be invoke after css build)
    'transport:css',  // .build/dist/*.css -> .build/src/*.css.js
    'concat:js',  // .build/src/* -> .build/dist/*.js

    // to ./build/dist
    'copy:build',
    'cssmin:css',   // .build/tmp/*.css -> .build/dist/*.css
    'uglify:js',  // .build/tmp/*.js -> .build/dist/*.js

    'check-debug',
    'check-online',
    // 'peaches', wait for new peaches 0.5.0

    'clean:dist',
    'copy:dist',  // .build/dist -> dist
    'clean:build',

    'spm-newline'
  ]);
};
