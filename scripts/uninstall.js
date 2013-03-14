#!/usr/bin/env node

try {
  require('spm').plugin.uninstall('zip');
  require('spm').plugin.uninstall('deploy');
} catch(e) {}
