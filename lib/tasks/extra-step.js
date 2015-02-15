'use strict';

var command = require('../utils/cmd-tool');
var RSVP    = require('rsvp');
var chalk   = require('chalk');

module.exports = steps;

function steps(steps, options, ui) {
  var cmd;
  var numberOfSteps = steps.length;
  var promises = steps.map(function(step) {

    cmd = command.build(step.command, options, step.includeOptions)

    return command.run(cmd, ui)
      .then(null, function(err) {
        if (step.fail) {
          return RSVP.Promise.reject(err);
        } else {
          ui.writeLine(chalk.red('Command failed: ') + step.command);
          ui.writeLine(chalk.green('resuming...'));

          return numberOfSteps--;
        }
      });
  });

  return RSVP.all(promises);
}
