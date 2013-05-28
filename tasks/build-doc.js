var spmrc = require('spmrc');
var path = require('path');
var runCommands = require('../lib/run-commands');

module.exports = function(grunt) {
  grunt.registerTask('build-doc', 'Build document using nico', function(target) {
    var theme = (pkg.family === 'alice') ? 'alice' : 'arale';
    var nicoConfig = path.join(
      spmrc.get('user.home'),
      '.spm/themes/' + theme + '/nico.js'
    );

    var done = this.async();
    runCommands([
      'nico build -C ' + nicoConfig
    ])(done);
  });
};
