var runCommands = require('../lib/run-commands');

module.exports = function(grunt) {
  grunt.registerTask('test-dist', 'test dist file', function(target) {
    var done = this.async();
    runCommands([
      'mocha-browser _site/tests/runner.html?dist -S'
    ])(done);
  });
};
