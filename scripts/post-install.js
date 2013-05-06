#!/usr/bin/env node

var spawn = require('win-spawn');
var fs = require('fs');
var path = require('path');
var spmrc = require('spmrc');
var semver = require('semver');

try {
  var spm = require('spm');
  spm.plugin.install({
    name: 'zip',
    binary: 'spm-zip',
    description: 'create a zip ball'
  });
  spm.plugin.install({
    name: 'check',
    binary: 'spm-check',
    description: 'check environment'
  });
  var gruntfile = path.join(__dirname, '..', 'Gruntfile.js');
  if (!spmrc.get('user.gruntfile')) {
    spmrc.set('user.gruntfile', path.normalize(gruntfile));
  }
  if (!spmrc.get('online-status')) {
    spmrc.set('online-status.stable', 'https://a.alipayobjects.com');
    spmrc.set('online-status.test', 'https://a.test.alipay.net');
    spmrc.set('online-status.dev', 'http://assets.dev.alipay.net');
  }
  if (!spmrc.get('source:default.url')) {
    spmrc.set('source:default.url', 'http://yuan.alipay.im');
  }
  if (!spmrc.get('source:spmjs.url')) {
    spmrc.set('source:spmjs.url', 'https://spmjs.org');
  }
} catch (e) {
  console.log(e.message || e);
  console.log('  you need install spm to register the program');
  console.log();
  console.log('    \x1b[31m$ npm install spm -g\x1b[0m');
  console.log();
  console.log("  if you have installed spm, it maybe you haven't set a NODE_PATH environment variable");
  console.log();
}

// install dependencies in global
var deps = require('./deps.json');
Object.keys(deps).forEach(function(module) {
  installModule(module, deps[module]);
})

// install spm-init templates
gitInstall('git://github.com/aralejs/template-arale.git', '~/.spm/init/arale');
gitInstall('git://github.com/aralejs/template-alice.git', '~/.spm/init/alice');

// install nico themes
gitInstall('https://github.com/aralejs/nico-arale.git', '~/.spm/themes/arale');
gitInstall('https://github.com/aliceui/nico-alice.git', '~/.spm/themes/alice');

function installModule(module, version) {
  if (!process.env.NODE_PATH) return;
  var p = path.join(process.env.NODE_PATH, module);
  if (fs.existsSync(p)) {
    // ignore when wrong format pkg
    try {
      var pkg = require(path.join(p, 'package.json'));
      if (semver.gte(pkg.version, version)) return;
    } catch(e) {}
  }
  spawn('npm', ['install', module, '-g'], {stdio: 'inherit'});
}

function gitInstall(url, dest) {
  dest = dest.replace('~', spmrc.get('user.home'));
  if (!fs.existsSync(dest)) {
    spawn('git', ['clone', url, dest], {stdio: 'inherit'});
  } else {
    spawn('git', ['pull', 'origin', 'master'], {stdio: 'inherit', 'cwd': dest});
  }
}
