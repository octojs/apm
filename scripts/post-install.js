#!/usr/bin/env node

var spawn = require('win-spawn');

try {
  var spm = require('spm');
  spm.plugin.install({
    name: 'zip',
    binary: 'spm-zip',
    description: 'create a zip ball'
  });
  spm.plugin.install({
    name: 'deploy',
    binary: 'spm-deploy',
    description: 'scp files to server'
  });
} catch (e) {
  console.log('  you need install spm to register the program');
  console.log();
  console.log('    \x1b[31m$ npm install spm@~2.0.0 -g\x1b[39m');
  console.log();
  console.log("  if you have installed spm, it maybe you haven't set a NODE_PATH environment variable");
  console.log();
}

spawn('npm', ['install', 'spm-init', '-g'], {stdio: 'inherit'});