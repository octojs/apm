var spawn = require('win-spawn');
var spmrc = require('spmrc');
var path = require('path');

module.exports = function(grunt) {
  grunt.registerTask('publish-doc', 'Publish document', function(target) {
    var pkg = require(path.resolve('package.json'));
    var nicoConfig = path.join(
      spmrc.get('user.home'),
      '.spm/themes/arale/nico.js'
    );

    var done = this.async();
    var server = ['jquery', 'arale', 'gallery'].indexOf(pkg.family) > -1 ? 'spmjs' : 'alipay';

    runCommands([
      'rm -rf _site',
      'nico build -C ' + nicoConfig,
      'spm publish --doc _site -s ' + server
    ])(done);
  });
};

// Run command synchronously
function runCommands(cmds) {
  return function(callback) {
    if (!cmds.length) {
      callback();
      return;
    }
    var cmd = cmds[0].split(' ');
    spawn(cmd[0], cmd.slice(1), { stdio: 'inherit'}).on('close', function() {
      runCommands(cmds.slice(1))(callback);
    });
  };
}
