'use strict';

var fileTool  = require('../utils/file-tool');
var Promise   = require('../ext/promise');
var extend    = require('extend');
var chalk     = require('chalk');
var async     = require('async');
var path      = require('path');
var mime      = require('mime');
var fs        = require('fs');
var execSync  = require('sync-exec');

mime.default_type = 'text/plain';

/**
 *  Sets the correct bucket for the s2 instance
 *   incase the wrong or no region was provided
 *
 *  @method updateBucketLocation
 *  @param {Object} s3 an S3 instance
 *  @param {String} loc The region of the bucket
 */
function updateBucketLocation(s3, loc) {
  var location = s3.config.region;
  if (location !== loc.LocationConstraint) {
    s3.config.region = loc.LocationConstraint;
  }
}


/**
 *
 *
 *  @method validateBucket
 *  @param {Object} s3 an S3 instance
 *  @param {Object} ui
 */
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

/**
 *
 *
 *  @method uploadDirectory
 *  @param {Object} s3 an S3 instance
 *  @param {Object} ui
 *  @param {String} dir The directory to upload to s3
 */
module.exports.uploadDirectory = function(s3, ui, dir) {

  var queue = async.queue(function(file, callback) {
    var params = buildFileParameters(file.name, file.fullPath, {
      ContentLength: file.size
    });

    module.exports.uploadFile(s3, ui, file.fullPath, params).then(function(data) {
      callback();
    }, function(err) {
      callback(err);
    });

  }, 2);

  return new Promise(function(resolve, reject) {

    ui.pleasantProgress.start(chalk.green('Uploading files to ') + s3.config.params.Bucket, chalk.green('.'));

    queue.drain = function() {
      ui.pleasantProgress.stop();
      return resolve();
    }

    fileTool.readDirectory(dir)
      .then(function(files) {

        files.forEach(function(file) {
          queue.push({
            fullPath: file.fullPath,
            name: file.path,
            size: file.stat.size
          }, function(err) {
            if (err) {
              throw err
            };
          });
        });

      }, function(err) {
        return reject(err);
      })
      .catch(function(err) {
        return reject(err);
      });
    });
}

/**
 *
 *
 *  @method uploadFile
 *  @param {Object} s3 an S3 instance
 *  @param {Object} ui
 *  @param {String} fullPath The full path of the file to upload
 *  @params {Object} params Parameters containing file details
 */
module.exports.uploadFile = function(s3, ui, fullPath, params) {
  var params = params || {};
  var putObject = Promise.denodeify(s3.putObject.bind(s3));
  var fileStream = fs.createReadStream(fullPath);
  var fileName = path.basename(fullPath);

  params.Body = fileStream;
  params.Key = params.Key ? params.Key : fileName;

  return putObject(params).then(function(data) {
    ui.writeLine(chalk.green('Upload complete: ') + fullPath);
    return data;
  }, function(err) {
    ui.writeLine(chalk.red('Upload error: ') + fullPath);
    return Promise.reject(err);
  });
}

/**
 *
 *
 *  @method buildFileParameters
 *  @param {String} filePath
 *  @param {Object} options
 *  @return {Object} details on a file.
 */
function buildFileParameters(filePath, fullPath, options) {
  options = options || {};
  var mimeType = mime.lookup(filePath);
  var isGzip = !execSync('gzip -t "'+fullPath+'" 2> /dev/null').status;
  var params = {
    Key: filePath,
    ACL: 'public-read',
    CacheControl: "max-age=31536000, public",
    ContentType: mimeType
  };
  if (isGzip) {
    params.ContentEncoding = 'gzip';
  }
  return extend(params, options);
}
