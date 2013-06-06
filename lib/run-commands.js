// Run command synchronously
// Example:
//   runCommands([
//     'touch a',
//     'rm a'
//   ])(done)
//
var spawn = require('win-spawn');
var fs = require('fs');
var path = require('path');

module.exports = function runCommands(cmds) {
  return function(callback) {
    if (!cmds.length) {
      callback();
      return;
    }

    var cmd = cmds[0], output, out;
    var index = cmd.indexOf('>');
    if (index > -1) {
      output = cmd.substring(index + 1).replace(/(^\s+|\s+$)/g, '');
      cmd = cmd.substring(0, index).split(/\s+/);
    } else {
      cmd = cmd.split(/\s+/);
    }

    if (output) {
      out = fs.openSync(path.resolve(output), 'w');
    }

    spawn(cmd[0], cmd.slice(1), {stdio: [
      process.stdin,
      out ? out : process.stdout,
      process.stderr
    ]}).on('close', function() {
      runCommands(cmds.slice(1))(callback);
    });
  };
};
