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
    }
  });

  if (grunt.loadGlobalTasks) {
    grunt.loadGlobalTasks('spm-alipay-suite');
    var path = require('path');
    var rootdir = path.dirname(require.resolve('spm/node_modules/grunt-spm-build'));
    require(rootdir).initConfig(grunt, {pkg: pkg}, true);
    var data = grunt.file.readJSON(path.join(rootdir, 'package.json'));
    Object.keys(data.dependencies).forEach(function(name) {
      var taskdir = path.join(rootdir, 'node_modules', name, 'tasks');
      if (grunt.file.exists(taskdir)) {
        grunt.loadTasks(taskdir);
      }
    });
  } else {
    grunt.loadNpmTasks('grunt-check-online');
    grunt.loadNpmTasks('grunt-contrib-stylus');
  }

  grunt.registerTask('build', [
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
    'uglify:js',  // .build/dist/*.js -> dist/*.js

    // resource
    'clean:spm', // rm .build
    'newline',

    'check-online'
  ]);
};
