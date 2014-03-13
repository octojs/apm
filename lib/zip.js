var fs = require('fs');
var path = require('path');
var async = require('async');
var iduri = require('cmd-util').iduri;
var archiver = require('archiver');
var grunt = require('spm-grunt');

exports = module.exports = function(options, callback) {
  if (options.query) {
    var spm = require('spm');
    spm.install.config.source = options.source;
    spm.install.fetch(options.query, function(err, dest) {
      var name = options.query.replace(/\//g, '-') + '.zip';
      options.dest = path.resolve(options.dest || name);
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

  // family is same as root
  pkg.family || (pkg.family = pkg.root);

  var basedir = options.basedir || '{{family}}/{{name}}/{{version}}';
  basedir = iduri.idFromPackage(pkg, basedir);

  var zip = archiver('zip');
  zip.pipe(fs.createWriteStream(dest));

  grunt.file.recurse(src, function(filepath) {
    filename = basedir + '/' + path.relative(src, filepath);
    filename = filename.replace(/\\/g, '/');
    zip.append(fs.createReadStream(filepath), {name: filename});
  });

  zip.finalize(function(err, bytes) {
    callback(err, bytes, dest);
  });
}
exports.createZip = createZip;
