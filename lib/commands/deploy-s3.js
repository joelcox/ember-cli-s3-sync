'use strict';

var deployS3  = require('../tasks/deploy-s3');
var path      = require('path');
var chalk     = require('chalk');
var RSVP      = require('rsvp');

module.exports = {
  name: 'deploy:s3',
  aliases: ['s3'],
  description: 'Deploys assets from project\'s build output-path (/dist by default) to an S3 bucket.',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String },
    { name: 'output-path', type: path, default: 'dist/' },
    { name: 'skip-build', type: Boolean, default: false },
    { name: 'aws-key', type: String },
    { name: 'aws-secret', type: String },
    { name: 'aws-bucket', type: String },
    { name: 'aws-region', type: String }
  ],

  run: function(options) {
    var self = this;

    return this.build(options)
      .then(function() {
        return self.deploy(options);
      })
      .finally(function() {
        self.ui.pleasantProgress.stop();
      });
  },

  build: function(options) {
    if (options.skipBuild) {
      return new RSVP.Promise(function(resolve) {
          return resolve();
        });
    }

    var ui = this.ui;
    var self = this;
    var BuildTask = this.tasks.Build;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return this.extraStep('beforeBuild', options)
      .then(function() {
        ui.pleasantProgress.start(chalk.green('Building'), chalk.green('.'));
        return buildTask.run(options);
      })
      .then(function() {
        ui.pleasantProgress.stop();
        return self.extraStep('afterBuild', options);
      }, function(err) {
        throw err;
      });
  },

  deploy: function(options) {
    var self = this;
    var DeployTask = require('../tasks/deploy-s3');
    var deployTask = new DeployTask({
      ui: this.ui,
      options: options, // redundant?
      project: this.project   // since project has options
    });

    return this.extraStep('beforeDeploy', options)
      .then(function() {
        return deployTask.run();
      })
      .then(function() {
        return self.extraStep('afterDeploy', options);
      });
  },

  // place holder for configurable 'between' steps
  extraStep: function(when, options) {
    var ui = this.ui;
    ui.writeLine('Running step: ' + chalk.yellow(when));
    return new RSVP.Promise(function(resolve) {
        return resolve();
      });
  }

}
