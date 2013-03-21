var fs = require('fs');
var path = require('path');
var async = require('async');
var iduri = require('cmd-util').iduri;
var archiver = require('archiver');

var grunt;
try {
  grunt = require('spm').sdk.grunt;
} catch (e) {
  grunt = require('grunt');
}

exports = module.exports = function(options, callback) {
  if (options.query) {
    var spm = require('spm');
    spm.install.fetch(options.query, function(err, dest) {
      options.dest = path.resolve(options.dest || 'package.zip');
      process.chdir(dest);
      createZip(options, callback);
    });
  } else {
    createZip(options, callback);
  }
};

function createZip(options, callback) {
  // default values
  options = options || {};
  var pkg = options.pkg || grunt.file.readJSON('package.json');

  var src = path.resolve(options.src || 'dist');
  var dest = options.dest || pkg.name + '.zip';

  var basedir = options.basedir || '{{family}}/{{name}}/{{version}}';
  basedir = iduri.idFromPackage(pkg, basedir);

  var zip = archiver('zip');
  zip.pipe(fs.createWriteStream(dest));

  grunt.file.recurse(src, function(filepath) {
    filename = basedir + '/' + path.relative(src, filepath);
    filename = filename.replace(/\\/g, '/');
    zip.addFile(fs.createReadStream(filepath), {name: filename});
  });

  zip.finalize(function(err, bytes) {
    callback(err, bytes, dest);
  });
}
exports.createZip = createZip;
