'use strict';

var commands = require('./lib/commands');

module.exports = {
  name: 'ember-cli-deploy',

  includedCommands: function() {
    return commands;
  },

  deployConfigs: function() {
    this.ui.writeLine('placeholder for deploy configurations');
    return {
      aws: {
        key: 'abcde',
        secret: '123455',
      },
      redis: {
        key: 'hehe',
        port: 6742
      }
    };
  }

}
