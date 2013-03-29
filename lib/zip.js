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
    zip.addFile(fs.createReadStream(filepath), {name: filename});
  });

  zip.finalize(function(err, bytes) {
    callback(err, bytes, dest);
  });
}
module.exports = createZip;
