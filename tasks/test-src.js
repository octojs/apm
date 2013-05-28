var runCommands = require('../lib/run-commands');

module.exports = function(grunt) {
  grunt.registerTask('test-src', 'test src file', function(target) {
    var done = this.async();
    runCommands([
      'mocha-browser _site/tests/runner.html -S'
    ])(done);
  });
};
