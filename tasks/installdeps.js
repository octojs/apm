module.exports = function(grunt) {
  grunt.registerTask('installdeps', 'install dependencies', function() {
    try {
      var spm = require('spm');
      var done = this.async();
      spm.install({
        query:[]
      }, done);
    } catch (e) {
      grunt.log.error('should install spm');
    }
  });
};