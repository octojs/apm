var path = require('path');
module.exports = function (grunt) {
    grunt.registerTask('publish', 'spm publish', function () {
        var spm;
        try {
            spm = require('spm');
        } catch (e) {
            grunt.log.warn('spm not found');
            return;
        }
        var done = this.async();
        var pkg = require(path.resolve('./package.json'));
        var whiteList = ['seajs', 'jquery', 'gallery', 'arale', 'alice'];
        if (pkg && whiteList.indexOf(pkg.family) === -1) {
            spm.publish({
                force  : true,
                tarball: true
            }, done);
        }
    });
};
