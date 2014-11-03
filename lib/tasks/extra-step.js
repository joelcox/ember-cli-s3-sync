'use strict';

var runCommand  = require('../utils/run-command');
var RSVP        = require('rsvp');
var chalk   = require('chalk');

module.exports = steps;

function steps(steps, options, ui) {
  var promises = steps.map(function(step) {
    return runCommand(step.command, options, step.includeOptions, ui)
      .then(null, function(err) {
        if (step.fail) {
          return RSVP.Promise.reject(err);
        } else {
          ui.writeLine(chalk.red('Command failed: ') + step.command);
          ui.writeLine(chalk.green('resuming...'));
        }
      });
  });

  return RSVP.all(promises);
}
