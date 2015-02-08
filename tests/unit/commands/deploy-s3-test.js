'use strict';

var assert    = require('assert');
var requiring = require('requiring');

describe('deploy:s3 command with options', function() {
  var commandOptions;
  var DeployS3Command = require('../../../lib/commands/deploy-s3');
  var configFile;

  before(function() {

    // DeployS3Command = require('../../../lib/commands/deploy-s3');
    commandOptions = {
      environment: 'staging',
      outputPath: './distribution',
      skipBuild: true,
      awsKey: 'my-key',
      awsSecret: 'my-secret',
      awsBucket: 'my-bucket',
      awsRegion: 'us-east-1'
    };
    configFile = requiring('../helpers/dummy/config-s3');
  });

  beforeEach(function() {
    tasks = {
      Serve: Task.extend()
    };

    options = commandOptions({
      tasks: tasks,
      settings: {}
    });

    stub(tasks.Serve.prototype, 'run');
  });

  after(function() {
    DeployS3Command = null;
  });

});
