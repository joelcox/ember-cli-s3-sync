var fs        = require('fs');
var Promise   = require('../ext/promise');
var realpath  = Promise.denodeify(fs.realpath);
var readdirp  = require('readdirp');
var requiring = require('requiring');

var readdirAsync  = Promise.denodeify(readdirp);

/**
 *
 *
 * @method readDirectory
 * @param {String} dir The path of the directory to read
 * @return {Array} files
*/
module.exports.readDirectory = function(dir) {
  return readdirAsync({ root: dir })
    .then(function(data) {
      return data.files;
    }, function(err) {
      throw err;
    });
}

/**
 *
 *
 *  @method validateDirectory
 *  @param {String} dir The path to test for whether is real.
 *  @return {String} The full path if directory exists.
 */
module.exports.validateDirectory = function(dir) {
  return realpath(dir).then(function(dir) {
      return dir;
    }, function(err) {
      throw err;
    });
}
