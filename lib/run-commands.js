// Run command synchronously
//
// Example:
//   runCommands([
//     'touch a',
//     'rm a'
//   ])(done)
//
//   runCommands([
//     {
//       cmd: 'git pull origin master'
//       cwd: '/path/to/'
//     }
//   ])(done)
//
var spawn = require('win-spawn');
var fs = require('fs');
var path = require('path');

module.exports = function runCommands(cmds) {
  return function(callback) {
    callback = callback || function() {};

    if (!cmds.length) {
      callback();
      return;
    }

    var cmd = cmds[0], output, out, cwd;

    // handle the situation of
    // { cmd: 'git pull origin master', cwd: '/path/to/'}
    //
    if (typeof cmd === 'object') {
      cwd = cmd.cwd;
      cmd = cmd.cmd;
    }

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

    spawn(cmd[0], cmd.slice(1), {
      stdio: [
        process.stdin,
        out ? out : process.stdout,
        process.stderr
      ],
      cwd: cwd
    }).on('close', function() {
      runCommands(cmds.slice(1))(callback);
    });
  };
};
