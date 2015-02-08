'use strict';

var Promise = require('../ext/promise');
var dargs   = require('dargs');
var chalk   = require('chalk');
var exec    = require('child_process').exec;

module.exports = function(command, options, includes, ui) {
  return new Promise(function(resolve, reject) {
      if (!command) {
        return resolve('No command found');
      }

      options = options || {};
      var args = dargs(options, [], includes).join(' ');
      command += !!args ? ' ' + args : '';

      ui.writeLine(chalk.cyan(command));

      var step = exec(command, {
        cwd: process.cwd()
      }, function(err) {
        if (err !== null) {
          return reject(err);
        }
        return resolve(command);
      });

      step.stdout.pipe(ui.outputStream, {end: false});
    });
}
