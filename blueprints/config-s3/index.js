var Promise = require('../../lib/ext/promise');
var chalk   = require('chalk');

module.exports = {
  description: "Builds the configuration file for ember-cli-s3-sync (deploy/config.js)",

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
      message: 'Do you want to create deploy/config.js file in your app\'s home directory?'
    };

    this.ui.writeLine(chalk.red('Do not put your AWS credentials in a public file. \n') +
                      chalk.yellow('Consider hiding deploy/config.js from versioning (.gitignore, .hgignore, etc.). \n'));

    return this.ui.prompt([disclaimer]).then(function(results) {
        if (results.understand) {
          return Promise.resolve();
        } else {
          return Promise.reject('deploy/config.js file not created.');
        }
      });
  },

  afterInstall: function() {
    return;
  }
};
