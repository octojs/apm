try {
  var spm = require('spm');
} catch (e) {
  console.log('  You need install spm first');
  process.exit(2);
}
var grunt = spm.sdk.grunt;

module.exports = function(options) {

  grunt.spm.init('deploy', options, function(grunt) {
    grunt.log.error('You need a Gruntfile.js');
    console.log();
    process.exit();
  });
};
