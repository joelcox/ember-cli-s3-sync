'use strict';

var path      = require('path');
var chalk     = require('chalk');
var Promise   = require('../ext/promise');
var requiring = require('requiring');

module.exports = {
  name: 'deploy:s3',
  aliases: ['s3'],
  description: 'Deploys assets from project\'s build output-path (/dist by default) to an S3 bucket.',
  works: 'insideProject',
  environment: 'development',
  configFile: null,

  config: requiring.sync('./config-s3', function() {
    return require('../../package.json')['config'];
  }),

  availableOptions: [
    { name: 'environment',  type: String,   default: 'development' },
    { name: 'output-path',  type: path,     default: 'dist/' },
    { name: 'skip-build',   type: Boolean,  default: false },
    { name: 'aws-key',      type: String },
    { name: 'aws-secret',   type: String },
    { name: 'aws-bucket',   type: String },
    { name: 'aws-region',   type: String }
  ],

  run: function(options) {
    var deploy = this.deploy.bind(this);
    var ui = this.ui;

    process.env.EMBER_ENV = this.environment = options.environment;
    this.configFile = this.config(this.environment);

    return this.build(options)
      .then(function() {
        return deploy(options);
      }, function(err) {
        return Promise.reject(err);
      });
  },

  build: function(options) {
    if (options.skipBuild) {
      return new Promise(function(resolve) {
          return resolve();
        });
    }

    var ui = this.ui;
    var extraStep = this.extraStep.bind(this);
    var BuildTask = this.tasks.Build;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return extraStep('beforeBuild', options)
      .then(function() {
        ui.pleasantProgress.start(chalk.green('Building'), chalk.green('.'));
        return buildTask.run(options);
      })
      .then(function() {
        ui.pleasantProgress.stop();
        return extraStep('afterBuild', options);
      }, function(err) {
        return Promise.reject(err);
      });
  },

  deploy: function(options) {
    var DeployTask = require('../tasks/deploy-s3');
    var extraStep = this.extraStep.bind(this);
    var deployTask = new DeployTask({
      ui: this.ui,
      options: options,
      project: this.project,
      config: this.configFile
    });

    return extraStep('beforeDeploy', options)
      .then(function() {
        return deployTask.run();
      })
      .then(function() {
        return extraStep('afterDeploy', options);
      });

  },

  extraStep: function(when, options) {
    var extraStep = require('../tasks/extra-step');
    var config = this.configFile;
    var steps = config[when] || [];

    this.ui.writeLine('Running step: ' + chalk.green(when));
    return extraStep(steps, options, this.ui);
  }

}
