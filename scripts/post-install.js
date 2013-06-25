#!/usr/bin/env node

var spawn = require('win-spawn');
var fs = require('fs');
var path = require('path');
var spmrc = require('spmrc');
var semver = require('semver');
var runCommands = require('../lib/run-commands');

require('colorful').toxic();

console.log('Start Installing.'.cyan);
console.log();
console.log('Installing npm modules.'.cyan);

// install dependencies in global
var deps = require('./deps.json');
Object.keys(deps).forEach(function(module) {
  installModule(module, deps[module]);
});

console.log();
console.log('Installing plugin to spm.'.cyan);

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
  spm.plugin.install({
    name: 'test',
    binary: 'spm-test',
    description: 'A local testing tool on phantomjs'
  });
  spm.plugin.install({
    name: 'totoro',
    binary: 'spm-totoro',
    description: 'A simple, easy-to-use and stable front-end unit testing tool on totoro'
  });
} catch (e) {
  console.log(e.message || e);
  console.log('  you need install spm to register the program');
  console.log();
  console.log('    \x1b[31m$ npm install spm -g\x1b[0m');
  console.log();
  console.log("  if you have installed spm, it maybe you haven't set a NODE_PATH environment variable");
  console.log();
}

console.log();
console.log('Setting basic spmrc.'.cyan);

try {
  var gruntfile = path.join(__dirname, '..', 'Gruntfile.js');
  if (!spmrc.get('user.gruntfile')) {
    spmrc.set('user.gruntfile', path.normalize(gruntfile));
  }
  if (!spmrc.get('online-status')) {
    spmrc.set('online-status.stable', 'https://a.alipayobjects.com');
    spmrc.set('online-status.test', 'https://a.test.alipay.net');
    spmrc.set('online-status.dev', 'http://assets.dev.alipay.net');
  }
  if (!spmrc.get('source:default.url') ||
      spmrc.get('source:default.url') === 'https://spmjs.org') {
    spmrc.set('source:default.url', 'http://yuan.alipay.im');
  }
  if (!spmrc.get('source:spmjs.url')) {
    spmrc.set('source:spmjs.url', 'https://spmjs.org');
  }
  if (!spmrc.get('source:alipay.url')) {
    spmrc.set('source:alipay.url', 'http://yuan.alipay.im');
  }
} catch (e) {}

console.log();
console.log('Installing init template & nico template.'.cyan);

// install spm-init templates
gitInstall('git://github.com/aralejs/template-arale.git', '~/.spm/init/arale');
gitInstall('git://github.com/aralejs/template-alice.git', '~/.spm/init/alice');

// install nico themes
gitInstall('https://github.com/aralejs/nico-arale.git', '~/.spm/themes/arale');
gitInstall('https://github.com/aliceui/nico-alice.git', '~/.spm/themes/alice');

console.log();
console.log('Installing spm completion.'.cyan);

runCommands([
  ['cp', path.join(__dirname, '.spm_completion'), spmrc.get('user.home')].join(' ')
])(function() {
  var text = '\n. ~/.spm_completion';
  var bashFile = spmrc.get('user.home') + '/.bash_profile';
  var zshFile = spmrc.get('user.home') + '/.zshrc';

  var files = [bashFile, zshFile];
  for(var i in files) {
    var file = files[i];
    if (fs.existsSync(file)) {
      var result = fs.readFileSync(file).toString();
      if (!/spm_completion/.test(result)) {
        fs.writeFileSync(file, result + text);
      }
    } else {
      fs.writeFileSync(file, text);
    }
  }
});

console.log();
console.log('Finish Installtion successfully!'.magenta);
console.log();

// Helper
// ---

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
  console.log(('  Installing npm module ' + module).green);  
  spawn('npm', ['install', module, '-g'], {stdio: [null, null, null]});
}

function gitInstall(url, dest) {
  dest = dest.replace('~', spmrc.get('user.home'));
  if (!fs.existsSync(dest)) {
    console.log(('  Installing ' + url + ' to ' + dest).green);
    spawn('git', ['clone', url, dest], {stdio: [null, null, null]});
  } else {
    console.log(('  Updating ' + url + ' to ' + dest).green);
    spawn('git', ['pull', 'origin', 'master'], {stdio: [null, null, null], 'cwd': dest});
  }
}
