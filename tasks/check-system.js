var path = require('path');
var spawn = require('win-spawn');
module.exports = function (grunt) {
    grunt.registerTask('check-system', 'Check if family is same as systemName', function () {
        var outStr = '', errStr = '';
        var info = spawn('svn', ['info']);
        var pkg = require(path.resolve('./package.json'));
        var done = this.async();
        var errExit = false;
        // svn 不存在的情况马上返回
        info.on('error', function () {
            errExit = true;
            done();
        });
        info.stdout.on('data', function (data) {
            outStr += data.toString();
        });
        info.stderr.on('data', function (data) {
            errStr += data.toString();
        });
        info.on('close', function (code) {
            // 报错退出后不触发 close 的逻辑
            // 所以这里需要判断下
            if (errExit) {
                return;
            }
            // 取不到 svn info 信息
            if (errStr) {
                if (/is not a working copy/.test(errStr)) {
                    grunt.log.writeln('log version control is not svn');
                }
                done();
                return;
            }
            var systemName = getSystemName(outStr);
            // 系统名匹配不到
            if (!systemName) {
                grunt.log.warn('can not match systemName');
                done();
                return;
            }
            // 系统名和 family 不一致
            if (pkg.family !== systemName) {
                grunt.fail.warn('family should be ' + systemName);
                process.exit(1);
            }
            done();
        });
    });
};
function getSystemName(str) {
    var systemName;
    str.split(/\r|\n|\r\n/).forEach(function (o) {
        var m = o.match(/http:\/\/svnhz.alipay.net\/svn\/([^\/\s]*)/);
        if (m) {
            systemName = m[1];
        }
    });
    return systemName;
}
