#!/usr/bin/env node
var spawn = require('win-spawn');
var fs = require('fs');
var path = require('path');
var spmrc = require('spmrc');
var semver = require('semver');
var exeq = require('exeq');
var async = require('async');
var deps = require('./deps.json');
require('colorful').toxic();
async.waterfall([
    function (callback) {
        console.log('Start Installing.'.cyan);
        installModule('spm', deps['spm'], function () {
            delete deps.spm;
            callback();
        });
    },
    function (callback) {
        console.log();
        console.log('Installing npm modules.'.cyan);
        var tasks = [];
        Object.keys(deps).forEach(function (module, index, array) {
            tasks.push(function (done) {
                installModule(module, deps[module], done);
            });
        });
        async.waterfall(tasks, callback);
    },
    function (callback) {
        console.log();
        console.log('Installing spm plugins.'.cyan);
        try {
            var spm = require('spm');
            console.log(' Installing spm plugin spm-zip.'.green);
            spm.plugin.install({
                name       : 'zip',
                binary     : 'spm-zip',
                description: 'create a zip ball'
            });
            console.log(' Installing spm plugin spm-watch.'.green);
            spm.plugin.install({
                name       : 'watch',
                binary     : 'spm-watch',
                description: 'Deploy automaticly when you change local files'
            });
            console.log(' Installing spm plugin spm-doctor.'.green);
            spm.plugin.install({
                name       : 'doctor',
                binary     : 'spm-doctor',
                description: 'check environment'
            });
            console.log(' Installing spm plugin spm-test.'.green);
            spm.plugin.install({
                name       : 'test',
                binary     : 'spm-test',
                description: 'test your code in local by phantomjs'
            });
            console.log(' Installing spm plugin spm-totoro.'.green);
            spm.plugin.install({
                name       : 'totoro',
                binary     : 'spm-totoro',
                description: 'test your code in A-grade browsers by totoro'
            });
            console.log(' Installing spm plugin opm-init.'.green);
            spm.plugin.install({
                name       : 'project',
                binary     : 'opm-project',
                description: 'initialize your project'
            });
        } catch (e) {
            console.log(e.message || e);
            console.log('  you need install spm to register the program');
            console.log();
            console.log('    $ npm install spm -g'.red);
            console.log();
            console.log("  if you have installed spm, it maybe you haven't set a NODE_PATH environment variable");
            console.log();
        } finally {
            callback();
        }
    },
    function (callback) {
        console.log();
        console.log('Setting your spmrc file.'.cyan);
        try {
            var gruntfile = path.join(__dirname, '..', 'Gruntfile.js');
            if (!spmrc.get('user.gruntfile') ||
                spmrc.get('user.gruntfile').indexOf('spm-alipay-suite') > 0) {
                spmrc.set('user.gruntfile', path.normalize(gruntfile));
            }
            if (!spmrc.get('online-status')) {
                spmrc.set('online-status.online', 'https://a.alipayobjects.com');
                spmrc.set('online-status.test', 'https://a.test.alipay.net');
                spmrc.set('online-status.dev', 'http://assets.dev.alipay.net');
            }
            if (!spmrc.get('source:default.url') ||
                spmrc.get('source:default.url') === 'http://yuan.alipay.im') {
                spmrc.set('source:default.url', 'https://spmjs.org');
            }
            if (!spmrc.get('source:spmjs.url')) {
                spmrc.set('source:spmjs.url', 'https://spmjs.org');
            }
            if (!spmrc.get('source:alipay.url')) {
                spmrc.set('source:alipay.url', 'http://yuan.alipay.im');
            }
        } catch (e) {
            console.log(e);
        } finally {
            callback();
        }
    },
    function (callback) {
        var isWindows = process.platform === 'win32';
        if (isWindows) {
            callback();
        } else {
            console.log();
            console.log('Installing spm completion.'.cyan);
            exeq([
                ['cp', path.join(__dirname, '.spm_completion'), spmrc.get('user.home')].join(' ')
            ]).on('done',function () {
                    var text = '\n. ~/.spm_completion';
                    var profile = spmrc.get('user.home') + '/.profile';
                    var bashRc = spmrc.get('user.home') + '/.bashrc';
                    var bashProfile = spmrc.get('user.home') + '/.bash_profile';
                    var zshRc = spmrc.get('user.home') + '/.zshrc';
                    if (process.env.SHELL === '/bin/zsh') {
                        writeProfile(zshRc, text);
                    } else {
                        if (fs.existsSync(profile)) {
                            writeProfile(profile, text);
                        } else if (fs.existsSync(bashRc)) {
                            writeProfile(bashRc, text);
                        } else if (fs.existsSync(bashProfile)) {
                            writeProfile(bashProfile, text);
                        }
                    }
                    callback();
                }).run();
        }
    }
],
// optional callback
    function (err, results) {
        console.log();
        console.log('Finish Installtion successfully!'.green);
        console.log();
    });
// Helper
// ---
function installModule(module, version, callback) {
    if (!process.env.NODE_PATH) {
        skip('Can\'t found NODE_PATH.');
        return;
    }
    var p = path.join(process.env.NODE_PATH, module);
    if (fs.existsSync(p)) {
        // ignore when wrong format pkg
        try {
            var pkg = require(path.join(p, 'package.json'));
            if (semver.gte(pkg.version, version)) {
                skip(version + ' has been installed.');
                return;
            }
        } catch (e) {
        }
    }
    console.log(('  Installing npm module ' + module + '@' + version).green);
    exeq([
        'npm install ' + module + ' -g --silent'
    ]).on('done',function () {
            console.log((module + '@' + version + ' installed.').green);
            callback();
        }).run();
    function skip(message) {
        console.log(('  Skip npm module ' + module + '@' + version + ', because ' + message).grey);
        callback();
    }
}
function gitInstall(url, dest, callback) {
    var command;
    dest = dest.replace('~', spmrc.get('user.home'));
    if (!fs.existsSync(dest)) {
        console.log(('  Installing ' + url + ' to ' + dest).green);
        command = 'git clone ' + url + ' ' + dest;
    } else {
        console.log(('  Updating ' + url + ' to ' + dest).green);
        command = {
            cmd: 'git pull origin master',
            cwd: dest
        };
    }
    exeq([command]).on('done', callback).run();
}
function writeProfile(file, text) {
    if (fs.existsSync(file)) {
        var result = fs.readFileSync(file).toString();
        if (!/spm_completion/.test(result)) {
            fs.writeFileSync(file, result + text);
        }
    } else {
        fs.writeFileSync(file, text);
    }
}
//gitInstall('git://github.com/octojs/template-platform.git', '~/.spm/init/platform');
//gitInstall('git://github.com/octojs/template-kuma.git', '~/.spm/init/kuma');