var spmrc = require('spmrc');
var path = require('path');
var runCommands = require('../lib/run-commands');

module.exports = function(grunt) {
  grunt.registerTask('publish-doc', 'Publish document', function(target) {
    var pkg = require(path.resolve('package.json'));
    var nicoConfig = path.join(
      spmrc.get('user.home'),
      '.spm/themes/arale/nico.js'
    );
    var server = ['jquery', 'arale', 'gallery'].indexOf(pkg.family) > -1 ? 'spmjs' : 'alipay';

    var done = this.async();
    runCommands([
      'rm -rf _site',
      'nico build -C ' + nicoConfig,
      'spm publish --doc _site -s ' + server
    ])(done);
  });
};
