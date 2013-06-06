#!/usr/bin/env node

try {
  require('spm').plugin.uninstall('zip');
  require('spm').plugin.uninstall('check');
  require('spm').plugin.uninstall('test');
} catch(e) {}
