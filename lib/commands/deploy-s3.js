'use strict';

var deployS3 = require('../tasks/deploy-s3');
var path = require('path');
var chalk = require('chalk');

module.exports = {
  name: 'deploy:s3',
  aliases: ['s3'],
  description: 'Deploys assets from project\'s build output-path (/dist by default) to an S3 bucket.',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String },
    { name: 'output-path', type: path, default: 'dist/' },
    { name: 'aws-key', type: String },
    { name: 'aws-secret', type: String },
    { name: 'aws-bucket', type: String },
    { name: 'aws-region', type: String }
  ],

  run: function(commandOptions) {
    var ui = this.ui;
    var BuildTask = this.tasks.Build;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    var DeployTask = require('../tasks/deploy-s3');
    var deployTask = new DeployTask({
      ui: this.ui,
      options: commandOptions, // redundant?
      project: this.project   // since project has options
    });

    ui.pleasantProgress.start(chalk.green('Building'), chalk.green('.'));

    return buildTask.run({
        environment: commandOptions.environment,
        outputPath: commandOptions.outputPath
      })
      .then(function() {
        return deployTask.run()
      })
      .finally(function() {
        ui.pleasantProgress.stop();
      });
  }
}
