var path = require('path');

module.exports = function(grunt) {
  grunt.registerMultiTask('check-debug', 'Check if the dist file has "-debug" words.', function() {
    
    var done = this.async();

    var distfiles = [];
    this.files.forEach(function(fileObj) {
      fileObj.src.forEach(function(filepath) {
        filepath = path.join(fileObj.cwd, filepath); 

        // 只检查 js 文件
        if (filepath.indexOf('.js') > 0) {
          var content = grunt.file.read(filepath);
          content = content.slice(0, content.indexOf('\n'));
          
          // -debug 文件不允许出现 -debug-debug
          // 其他不允许出现 -debug
          if (filepath.indexOf('-debug.js') > 0 && 
            content.indexOf('-debug-debug') > 0) {
              grunt.log.warn(filepath + ' has "-debug-debug" words.');
              grunt.log.warn('There is debug denpendency in your code!');
              grunt.log.error('check-debug-fail');
              done(false);
          }
        }

      });
    });
    
    done();

  });
};
