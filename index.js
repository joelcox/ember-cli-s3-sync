'use strict';

var commands = require('./lib/commands');

module.exports = {
  name: 'ember-cli-deploy',

  includedCommands: function() {
    return commands;
  }

}
