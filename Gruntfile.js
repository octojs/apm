module.exports = function(grunt) {
  grunt.initConfig({
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
