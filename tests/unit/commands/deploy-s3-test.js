'use strict';

var assert    = require('assert');
var requiring = require('requiring');

// var command        = require('../../../lib/commands/deploy-s3');

// var stub           = require('../../helpers/stub').stub;
// var commandOptions = require('../../factories/command-options');

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


  it('has correct options', function() {
    new ServeCommand(options).validateAndRun([
      '--port', '4000'
    ]);

    var serveRun = tasks.Serve.prototype.run;
    var ops = serveRun.calledWith[0][0];

    assert.equal(serveRun.called, 1, 'expected run to be called once');

    assert.equal(ops.port,           4000,      'has correct port');
    assert.equal(ops.liveReloadPort, 35529,     'has correct liveReload port');
  });

  it('has correct liveLoadPort', function() {
    new ServeCommand(options).validateAndRun([
      '--live-reload-port', '4001'
    ]);

    var serveRun = tasks.Serve.prototype.run;
    var ops = serveRun.calledWith[0][0];

    assert.equal(serveRun.called, 1, 'expected run to be called once');

    assert.equal(ops.liveReloadPort, 4001,     'has correct liveReload port');
  });

  it('has correct proxy', function() {
    new ServeCommand(options).validateAndRun([
      '--proxy', 'http://localhost:3000/'
    ]);

    var serveRun = tasks.Serve.prototype.run;
    var ops = serveRun.calledWith[0][0];

    assert.equal(serveRun.called, 1, 'expected run to be called once');

    assert.equal(ops.proxy, 'http://localhost:3000/', 'has correct port');
  });
});
