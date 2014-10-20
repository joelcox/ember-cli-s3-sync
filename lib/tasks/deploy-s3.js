'use strict';

var CoreObject  = require('core-object');
var chalk       = require('chalk');
var DistDir     = require('../models/dist-dir');
var Config      = require('../utils/config-s3');
var s3Tool      = require('../utils/s3-tool');
var S3          = require('../models/s3');


function DeployS3() {
  CoreObject.apply(this, arguments);
}
DeployS3.__proto__ = CoreObject;

module.exports = DeployS3.extend({

  s3: null,
  distDir: null,
  s3Options: null,

  run: function() {
    var self = this;
    var ui = this.ui;

    return this.constructS3()
      .then(function(s3) { return s3Tool.validateBucket(s3, ui); })
      .then(function() { return self.constructDistDir(); })
      .then(function() { return self.distDir.validateDirectory(); })
      .then(function(dir) { return s3Tool.uploadDirectory(self.s3, ui, dir); })
      .catch(function(err) {
        ui.writeLine(chalk.red('Errors occured:'));
        ui.writeLine(err);
      });
  },

  /*
    Builds a new instance of S3

    @method constructS3
    @return Promise -> s3 instance wrapped in a resolved promise
  */
  constructS3: function() {
    var self = this;
    var config = new Config({
      ui: this.ui,
      commandOptions: this.options
    });

    return config.buildOptions().then(function(options) {
      var s3 = self.s3 = new S3(options);
      self.s3Options = options;
      return s3;

    }, function(err) {
      return this.ui.write(err);
    });
  },

  /*
    Wraps methods around the /dist directory.

    @method constructS3
    @return Promise -> distDir instance wrapped in a resolved promise
  */
  constructDistDir: function() {
    var distDir = this.distDir = new DistDir(this.ui, this.project, this.options);
    return distDir;
  },

  uploadDirectory: function(dir) {
    var filePath;
    var s3 = new AWS.S3({
      params: {
        Bucket: this.bucket
      }
    });
    var s3PutObject = Promise.denodeify(s3.putObject);

    return readdir(dir).then(function(files) {

      console.log(files);

      files.forEach(function(file) {

        filePath = path.join(dir, file);
        readFile(filePath).then(function(data) {

          s3PutObject(data).then(function(result) {
            console.log('then results:');
            console.log(result);

          }, function(reject) {
            console.log('rjected');
            console.log(reject);
          });

        });
      });
    });
  }

});
