var spawn = require('win-spawn');
var spmrc = require('spmrc');
var path = require('path');

module.exports = function(grunt) {
  grunt.registerTask('build-doc', 'Build document using nico', function(target) {
    var nicoConfig = path.join(
      spmrc.get('user.home'),
      '.spm/themes/arale/nico.js'
    );
    var done = this.async();
    var build = spawn('nico', ['build', '-C', nicoConfig], { stdio: 'inherit'});
    build.on('close', done);
  });
};
