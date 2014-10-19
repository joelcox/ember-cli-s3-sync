'use strict';

var CoreObject  = require('core-object');
var Config      = require('../utils/config-s3');
var chalk       = require('chalk');
var S3          = require('../models/s3');


function DeployS3() {
  CoreObject.apply(this, arguments);
}
DeployS3.__proto__ = CoreObject;

module.exports = DeployS3.extend({

  run: function() {
    var self = this;

    return this.constructS3()
      .then(function(s3) { console.log(s3) });

    // return configS3(this.ui)
    //   .then(function(results) {
    //     self.bucket = results.bucket;
    //   })
    //   .then(function() {
    //     return self.deploySteps();
    //   });
  },

  /*
    Builds a new instance of S3

    @method constructS3
    @return Promise
  */
  constructS3: function() {
    var config = new Config({
      ui: this.ui,
      commandOptions: this.options
    });

    return config.run().then(function(options) {
      var s3 = new S3(options);
      return s3;

    }, function(err) {
      return this.ui.write(err);
    });
  },

  deploySteps: function() {
    var self = this;

    return this.validateDistDirectory()
      .then(function(dir) {
        return self.uploadDirectory(dir);
      });
  },

  validateDistDirectory: function() {
    var rootPath = this.project.root || process.cwd();
    var outputPath = this.options.outputPath;
    var dirToSync = path.join(rootPath, outputPath);
    var ui = this.ui;

    return realpath(dirToSync).then(function(dir) {
      ui.writeLine(chalk.green('Valid Path: ') + dir);
      return dir;
    })
    .catch(function(err) {
      ui.writeLine(chalk.red('Invalid path: ') + err.path);
      return err;
    })
  },

  syncDir: function(dir) {
    return readdir(dir)
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

    // var config = AWS.Config({
    //   accessKeyId: this.options.awsKey || process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: this.options.awsSecret || process.env.AWS_SECRET_ACCESS_KEY
    // });


});
