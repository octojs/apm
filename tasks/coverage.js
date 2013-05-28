var spmrc = require('spmrc');
var path = require('path');
var runCommands = require('../lib/run-commands');

module.exports = function(grunt) {
  grunt.registerTask('coverage', 'Coverage', function(target) {
    var output = '_site/coverage.html';
    var done = this.async();
    runCommands([
      'rm -fr _site/src-cov',
      'jscoverage --encoding=utf8 src _site/src-cov',
      'mocha-browser _site/tests/runner.html?cov -S -R html-cov > ' + output
    ])(function() {
      console.log();
      grunt.log.writeln('coverage build to ' + output);
      done();
    });
  });
};
