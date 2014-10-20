'use strict';
var fs        = require('fs');
var path      = require('path');
var chalk     = require('chalk');
var Promise   = require('../ext/promise');
var realpath  = Promise.denodeify(fs.realpath);
var readdir   = Promise.denodeify(fs.readdir);
var readFile  = Promise.denodeify(fs.readFile);


module.exports = DistDir;

function DistDir(ui, project, commandOptions) {
  this.ui = ui;
  this.project = project;
  this.commandOptions = commandOptions;
  this.directory = null;
}

DistDir.prototype.validateDirectory = function() {
  var self = this;
  var ui = this.ui;
  var rootPath = this.project.root || process.cwd();
  var outputPath = this.commandOptions.outputPath;
  var distDir = path.join(rootPath, outputPath);

  return realpath(distDir).then(function(dir) {
      ui.writeLine(chalk.green('Path is valid: ') + dir);
      self.directory = distDir;
      return dir;
    })
    .catch(function(err) {
      ui.writeLine(chalk.red('Path is invalid: ') + err.path);
      self.directory = null;
      throw err;
    });
}

DistDir.prototype.syncDirectory = function(dir) {
  dir = dir || this.directory;

  return this.ui.writeLine('syncing directory!');
}

DistDir.prototype.gatherFiles = function() {
  var dir = this.directory;

}
