module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
    }
  });

  if (grunt.loadGlobalTasks) {
    grunt.loadGlobalTasks('spm-alipay-suite');

    // load default spm tasks
    var spm = require('spm');
    spm.build.loadBuildTasks();
  } else {
    grunt.loadNpmTasks('grunt-scp');
    grunt.loadNpmTasks('grunt-check-online');
  }

  grunt.registerTask('build', ['spm-build', 'check-online']);
  grunt.registerTask('deploy', ['scp']);
};
