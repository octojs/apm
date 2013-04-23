#!/usr/bin/env node

var spawn = require('win-spawn');
var fs = require('fs');
var path = require('path');

try {
  var spm = require('spm');
  spm.plugin.install({
    name: 'zip',
    binary: 'spm-zip',
    description: 'create a zip ball'
  });
  var gruntfile = path.join(__dirname, '..', 'Gruntfile.js');
  var spmrc = require('spmrc');
  if (!spmrc.get('user.gruntfile')) {
    spmrc.set('user.gruntfile', path.normalize(gruntfile));
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

installModule('spm-init');
installModule('spm-build');
installModule('spm-status');
installModule('spm-deploy');


function installModule(module) {
  if (!process.env.NODE_PATH) return;
  var p = path.join(process.env.NODE_PATH, module);
  if (!fs.existsSync(p)) {
    spawn('npm', ['install', module, '-g'], {stdio: 'inherit'});
  }
}
