var chalk     = require('chalk');
var fileTool  = require('../../lib/utils/file-tool');

module.exports = {
  description: "Build the configuration file for ember-cli-s3-sync",

  anonymousOptions: [],

  normalizeEntityName: function(entityName) {
    return;
  },

  // TODO: check for credentials file?
  beforeInstall: function() {
    return;
  },

  afterInstall: function() {
    var rootPath = this.project.root;

    var gitignorePrompt = {
      type: 'confirm',
      name: 'gitignore',
      default: 'y',
      message: 'Would you like to add "config-s3.json" file to your .gitignore?'
    };

    this.ui.writeLine(chalk.red('If placing AWS credentials in ') + chalk.yellow('"config-s3.json"') + chalk.red(' it\'s highly recommended to add file to .gitignore'));
    return this.ui.prompt([gitignorePrompt]).then(function(results) {
        return fileTool.addToGitignore('config-s3.json', rootPath);
      });
  }
};
