var Promise = require('../../lib/ext/promise');
var chalk   = require('chalk');

module.exports = {
  description: "Build the configuration file for ember-cli-s3-sync",

  anonymousOptions: [],

  normalizeEntityName: function(entityName) {
    return;
  },

  // TODO: check for credentials file?
  beforeInstall: function() {
    var rootPath = this.project.root;

    var disclaimer = {
      type: 'confirm',
      name: 'understand',
      default: 'y',
      message: 'Do you understand the risk involved with placing ' +
               'credentials and/or AWS information inside a public file?'
    };

    this.ui.writeLine(chalk.red('If placing AWS credentials in ') +
                      chalk.yellow('"config-s3.js"') +
                      chalk.red(' it\'s highly recommended to ignore this fie ' +
                                'from versioning (.gitignore, .hgignore, etc.).'));

    return this.ui.prompt([disclaimer]).then(function(results) {
        if (results.understand) {
          return Promise.resolve();
        } else {
          return Promise.reject('You must understand :)');
        }
      });
  },

  afterInstall: function() {
    return;
  }
};
