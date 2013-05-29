var spmrc = require('spmrc');
var path = require('path');
var runCommands = require('../lib/run-commands');

module.exports = function(grunt) {
  grunt.registerTask('build-doc', 'Build document using nico', function(target) {
    var pkg = require(path.resolve('package.json'));
    var theme = getTheme(pkg);
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

function getTheme(pkg) {
  if (pkg.family === 'alice') return 'alice';
  // output 中全是样式才用 alice
  var output = pkg.spm.output;
  if (output) {
    for (var i in output) {
      var f = output[i];
      if (!/\.(css|stylus|less)$/.test(f)) return 'arale';
    }
  }
  return 'alice';
}