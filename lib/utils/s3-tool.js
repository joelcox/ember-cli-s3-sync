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
 *  Sets the correct bucket for the s3 instance
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
 *  @param {Options} options The options hash of cl
 */
module.exports.uploadDirectory = function(s3, ui, dir, options) {
    var prependPath = s3.config.prependPath || '';
    var bucketPath, params, filePath;

  var queue = async.queue(function(file, callback) {

    filePath = path.join(prependPath, file.name);

    params = buildFileParameters(file.fullPath, {
      Key: filePath,
      ContentLength: file.size
    });

    module.exports.uploadFile(s3, ui, file.fullPath, params).then(function(data) {
      callback();
    }, function(err) {
      callback(err);
    });

  }, 2);

  return new Promise(function(resolve, reject) {
    bucketPath = prependPath ? s3.config.params.Bucket + '/' + prependPath : s3.config.params.Bucket;

    ui.pleasantProgress.start(chalk.green('Uploading files to ') + bucketPath, chalk.green('.'));

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
 *  @param {String} filePath file path to be created in s3 bucket
 *  @param {String} fullPath path of file on your hard drive
 *  @param {Object} options
 *  @return {Object} details on a file.
 */
function buildFileParameters(fullPath, options) {
  options = options || {};
  var mimeType = mime.lookup(fullPath);
  var isGzip = !execSync('gzip -t "'+fullPath+'" 2> /dev/null').status;
  var params = {
    ACL: 'public-read',
    CacheControl: "max-age=31536000, public",
    ContentType: mimeType
  };
  if (isGzip) {
    params.ContentEncoding = 'gzip';
  }
  return extend(params, options);
}
