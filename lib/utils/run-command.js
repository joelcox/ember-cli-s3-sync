'use strict';

var Promise = require('../ext/promise');
var exec    = require('child_process').exec;
var dargs   = require('dargs')

module.exports = function(command, ui, options, includes) {
  return new Promise(function(resolve, reject) {
      if (!command) { return reject('No command found'); }
      options = options || {};
      var args = dargs(options, [], includes).join(' ');
      command += ' ' + args;

      var step = exec(command, {
        cwd: process.cwd()
      }, function(err) {
        if (err !== null) { return reject(err); }
        return resolve();
      });

      step.stdout.pipe(ui.outputStream, {end: false});

    });
}
