// Run command synchronously
// Example:
//   runCommands([
//     'touch a',
//     'rm a'
//   ])(done)
//
var spawn = require('win-spawn');
module.exports = function runCommands(cmds) {
  return function(callback) {
    if (!cmds.length) {
      callback();
      return;
    }
    var cmd = cmds[0].split(' ');
    spawn(cmd[0], cmd.slice(1), { stdio: 'inherit'}).on('close', function() {
      runCommands(cmds.slice(1))(callback);
    });
  };
};
