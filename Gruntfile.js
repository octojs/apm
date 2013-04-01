module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: pkg,
    target: grunt.option('target') || 'dev',
    password: grunt.option('password') || 'alipaydev',

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
          dest: '<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>'
        }]
      }
    },

    scp: {
      options: {
        username: 'admin',
        password: '<%= password %>',
        host: 'assets.<%= target %>.alipay.net'
      },
      assets: {
        files: [{
          cwd: 'dist',
          src: '**/*',
          dest: '/home/admin/wwwroot/assets/<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>'
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
        }]
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
  grunt.loadNpmTasks('grunt-scp');
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
    'cssmin:css',   // .build/dist/*.css -> dist/*.css

    // build js (must be invoke after css build)
    'transport:css',  // .build/dist/*.css -> .build/src/*.css.js
    'concat:js',  // .build/src/* -> .build/dist/*.js
    'uglify:js',  // .build/dist/*.js -> dist/*.js

    // resource
    'copy:spm', //
    'clean:spm', // rm .build
    'newline',

    'check-online'
  ]);
  grunt.registerTask('deploy', ['scp']);
};
