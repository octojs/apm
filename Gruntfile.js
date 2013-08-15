module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,
    target: grunt.option('target') || 'dev',

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
      },

      deploy: {
        options: {
          // status code should be 404
          statusCode: 404,
          server: 'https://a.alipayobjects.com',
          onFailure: function() {
            grunt.log.writeln("Check files is existed online, no need to publish.");
            process.exit(0);
          }
        },
        files: [{
          cwd: 'dist',
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

    less: {
      compile: {
        files: [{
          cwd: 'src',
          src: '**/*.less',
          expand: true,
          ext: '.css',
          dest: '.build/less/'
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
      },
      less: {
        files: [{
          cwd: '.build/less',
          src: '**/*',
          filter: 'isFile',
          dest: '.build/src'
        }]
      }
    },

    peaches: {
      sprite: {
        options: pkg.spm.peaches,
        files: [{
          cwd: '.build/dist',
          src: '**/*.css',
          dest: '.build/dist'
        }]
      }
    },

    scp: {
      options: {
        username: grunt.option('username') || 'admin',
        password: grunt.option('password') || 'alipaydev',
        host: 'assets.<%= target %>.alipay.net',
        log: function(o) {
          var dest = o.destination.replace('/home/admin/wwwroot/assets', '');
          var base = 'http://assets.' + (grunt.option('target') || 'dev') + '.alipay.net';
          grunt.log.writeln('online ' + base + dest);
        }
      },
      assets: {
        files: [{
          cwd: 'dist',
          src: '**/*',
          filter: 'isFile',
          dest: '/home/admin/wwwroot/assets/<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>'
        }]
      }
    },

    watch: {
      options: {
        dateFormat: function(time) {
          grunt.log.writeln('Finished in ' + time + 'ms at ' +
            (new Date()).toString());
          grunt.log.writeln('Waiting for more changes...');
        },
        spawn: false
      },
      scripts: {
        files: ['src/**/*.js',
                'src/**/*.css',
                'src/**/*.less',
                'src/**/*.styl',
                'src/**/*.tpl',
                'src/**/*.handlerbars',
                'src/**/*.html',
                'src/**/*.json',
                'package.json'],
        tasks: ['build', 'scp']
      }
    }

  });

  if (!grunt.loadGlobalTasks) {
    grunt.log.error("You shouldn't use grunt to run the tasks");
  }

  grunt.loadGlobalTasks('apm');
  grunt.loadGlobalTasks('spm-build');

  var builder = require('spm-build');
  var options = builder.parseOptions();
  if (options.pkg.spm && options.pkg.spm.output) {
    options.pkg.spm.output = options.pkg.spm.output.map(function(item) {
      item = item.replace(/\.less$/, '.css');
      item = item.replace(/\.styl/, '.css');
      return item
    });
  }
  var config = builder.getConfig(options);
  grunt.util._.merge(grunt.config.data, config);

  var taskList = [
    'clean:build', // delete build direcotry first
    'check-system',

    'spm-install', // install dependencies

    // build stylus
    'stylus', // src/*.styl -> .build/stylus/*.css
    'transport:stylus', // .build/stylus/*.css -> .build/src/*.css

    // build less
    'less', // src/*.less -> .build/less/*.css
    'transport:less', // .build/less/*.css -> .build/src/*.css

    // build css
    'transport:src',  // src/* -> .build/src/*
    'concat:css',   // .build/src/*.css -> .build/tmp/*.css

    // build js (must be invoke after css build)
    'transport:css',  // .build/tmp/*.css -> .build/src/*.css.js
    'concat:js',  // .build/src/* -> .build/dist/*.js

    // to ./build/dist
    'copy:build',
    'cssmin:css',   // .build/tmp/*.css -> .build/dist/*.css
    'uglify:js',  // .build/tmp/*.js -> .build/dist/*.js

    'check-debug',
    'check-online:alipay',
    'peaches',

    'clean:dist',
    'copy:dist',  // .build/dist -> dist
    'clean:build',

    'spm-newline'
  ];

  if (!pkg.spm.peaches) {
    taskList.splice(taskList.indexOf('peaches'), 1);
  }

  grunt.registerTask('deploy', ['scp', 'delete-deploy-file', 'check-online:deploy', 'publish']);
  grunt.registerTask('build', taskList);

};
