'use strict';

var readdirp  = require('readdirp');
var Promise   = require('../ext/promise');
var extend    = require('extend');
var chalk     = require('chalk');
var async     = require('async');
var path      = require('path');
var RSVP      = require('rsvp');
var mime      = require('mime');
var fs        = require('fs');

var readdirAsync  = Promise.denodeify(readdirp);
mime.default_type = 'text/plain';

function updateBucketLocation(s3, loc) {
  var location = s3.config.region;
  if (location !== loc.LocationConstraint) {
    s3.config.region = loc.LocationConstraint;
  }
}

module.exports.validateBucket = function(s3, ui) {

  var getBucketLocation = Promise.denodeify(s3.getBucketLocation.bind(s3));

  ui.pleasantProgress.start(chalk.green('Verifying bucket'), chalk.green('.'));

  return getBucketLocation().then(function(locData) {
      ui.pleasantProgress.stop();
      ui.writeLine(chalk.green('Bucket found: ') + s3.config.params.Bucket);
      updateBucketLocation(s3, locData);
      return locData;

    }, function(err) {
      ui.writeLine(chalk.red('Error locating bucket: ') + s3.config.params.Bucket);
      throw err;
    });
}

module.exports.uploadDirectory = function(s3, ui, dir) {
  var queue = async.queue(function(file, callback) {

    var params = buildFileParameters(file.name, {
      ContentLength: file.size
    });
    module.exports.uploadFile(s3, ui, file.fullPath, params).then(function(data) {
      callback();
    }, function(err) {
      callback(err);
    });

  }, 2);

  return new RSVP.Promise(function(resolve, reject) {

    ui.pleasantProgress.start(chalk.green('Uploading files to ') + s3.config.params.Bucket, chalk.green('.'));

    queue.drain = function() {
      ui.pleasantProgress.stop();
      return resolve();
    }

    readdirAsync({ root: dir })
      .then(function(data) {
        data.files.forEach(function(file) {
          queue.push({
            fullPath: file.fullPath,
            name: file.path,
            size: file.stat.size
          }, function(err) {
            if (err) { throw err };
            ui.writeLine(chalk.yellow('Added to queue: ') + file.fullPath);
          });

        });

      }, function(err) {
        throw err;
      });
    })
    .catch(function(err) {
      reject();
    });

  // return module.exports.uploadFile(s3, ui, dir, 'index.html');

}

module.exports.uploadFile = function(s3, ui, fullPath, params) {
  // var params = buildFileParameters(file);
  // var filePath = path.join(fileDir, file);
  var params = params || {};

  var putObject = Promise.denodeify(s3.putObject.bind(s3));
  var fileStream = fs.createReadStream(fullPath);
  var fileName = path.basename(fullPath);

  ui.writeLine(chalk.green('Uploading file: ') + fullPath);

  params.Body = fileStream;
  params.Key = params.Key ? params.Key : fileName;

  return putObject(params).then(function(data) {
    return data;
  }, function(err) {
    throw err;
  });
}

function buildFileParameters(filePath, options) {
  options = options || {};
  var expires = new Date(new Date().getTime() + 360000);
  var mimeType = mime.lookup(filePath);
  var params = {
    Key: filePath,
    ACL: 'public-read',
    CacheControl: "max-age=3600, public",
    Expires: expires,
    ContentType: mimeType
  };
  return extend(params, options);
}
