'use strict';

var CoreObject = require('core-object');
var config    = require('../../package.json')['config'];
var s3Options = config['s3Options'];
var Promise   = require('../ext/promise');
var extend    = require('extend');
var chalk     = require('chalk');
var path      = require('path');
var fs        = require('fs');
var openFile  = Promise.denodeify(fs.open);

function Config() {
  CoreObject.apply(this, arguments);
}
Config.__proto__ = CoreObject;

module.exports = Config.extend({

  /*
    Holds the options that will be passed to construct the S3 instance.
    The default options come from `config.s3Options` in package.json
    @property options
    @default `config.s3Options`
    @type {Object}
  */
  options: s3Options,

  // only here as reminder to document config options in package.json
  /*
    Whether or not to use credentials file by default, **if** found.
    When `true` the user wil not be prompted and it's up to aws-sdk to find cred file or use process.env variables.
    When `false` the user will be prompted for `access_key_id` and `secret_access_key`.
    This property is read from the config hash in package.json
    ```
      { name: 'ember-cli-s3-sync',
        config: {
          useCredFile: undefined //default
        }
      }
    ```
    @property useCredFile
    @default true
    @type {Boolean}
  */
  credFilePrompt: config.credFilePrompt,

  /*
    prompts the use whether or not they'd like to use the found
    `~/.aws/credentials` file, or specify their own credentials.

    @method promptCredFile
  */
  run: function() {
    var self = this;

    this.options.logger = this.ui.outputStream;

    return this.checkSharedCreds()
      .then(function(options) { return self.promptForRequired() })
      .then(function(options) { return self.promptForOptional() })
      .then(function(options) { return self.saveOptionsFile() });
  },

  /*
    checks HOME_DIR/.aws/credentials for an aws credentials file.
    [create shared credential file](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Creating_the_Shared_Credentials_File)

    @method checkSharedCreds
  */
  checkSharedCreds: function() {
    var self = this;
    var ui = this.ui;
    var homeDir = process.platform === 'win32'
        ? process.env.HOMEPATH || process.env.USERPROFILE
        : process.env.HOME

    var credFilePath = path.join(homeDir, '.aws', 'credentials');

    return openFile(credFilePath, 'r').then(function(fd) {
      ui.write(credFilePath + chalk.green(' found.' + '\r\n'));

      if (config.credFilePrompt) {
        return self.promptCredFile();
      }

    }, function(err) {
      ui.write(credFilePath + chalk.red(' not found.' + '\r\n'));
      return self.promptForKeys();
    });
  },

  promptCredFile: function() {
    var self = this;
    var credFilePrompt = {
      type: 'confirm',
      name: 'useFile',
      default: 'n',
      message: 'Would you like to use the found AWS shared credentials file?'
    };

    return this.ui.prompt([credFilePrompt]).then(function(results) {
      if (!results.useFile) {
        return self.promptForKeys();
      } else {
        return this.options;
      }

    });
  },

  getEnvKeys: function() {
    var key = this.commandOptions.awsKey
      || process.env.AWS_ACCESS_KEY_ID
      || s3Options.accessKeyId
      || this.options.accessKeyId;
    var secret = this.commandOptions.awsSecret
      || process.env.AWS_SECRET_ACESS_KEY
      || s3Options.secretAccessKey
      || this.options.secretAccessKey;

    return {
      accessKeyId: key,
      secretAccessKey: secret
    };
  },

  promptForKeys: function() {
    var self = this;
    var prompts = [];
    var envKeys = this.getEnvKeys();
    var key = process.env.AWS_ACCESS_KEY_ID || undefined;
    var secret = process.env.AWS_SECRET_ACESS_KEY || undefined;

    var keyPrompt = {
      type: 'input',
      name: 'accessKeyId',
      default: key,
      message: 'Please enter your AWS access key id'
    };

    var secretPrompt = {
      type: 'input',
      name: 'secretAccessKey',
      default: secret,
      message: 'Please enter your AWS secret access key'
    }

    return this.ui.prompt([keyPrompt, secretPrompt])
      .then(function(results) {
        return self.setOptions(results);
      });
  },

  getRequired: function() {
    var bucket = this.commandOptions.awsBucket
      || s3Options.awsBucket
      || this.options.awsBucket;
    var region = this.commandOptions.awsRegion
      || s3Options.region
      || this.options.region;

    return {
      awsBucket: bucket,
      region: region
    };
  },

  promptForRequired: function() {
    var self = this;
    var prompts = [];
    var reqFields = this.getRequired();

    var bucketPrompt = {
      type: 'input',
      name: 'awsBucket',
      message: 'Please enter an S3 bucket'
    };

    var regionPrompt = {
      type: 'input',
      name: 'region',
      default: 'us-east-1',
      message: 'Please enter a region or leave blank for default'
    };

    if (!reqFields.awsBucket) prompts.push(bucketPrompt);
    if (!reqFields.region) prompts.push(regionPrompt);

    return this.ui.prompt(prompts).then(function(results) {
      results = extend(results, reqFields);
      return self.setOptions(results);
    });
  },

  getOptional: function() {
    var max = s3Options.maxRetries
    return {
      maxRetries: max
    };
  },

  /*
    TODO: implement? might be too verbose unless this
    turns into a one-time set it and forget it option

    @method promptForOptional
    @return Promise -> this.options
  */
  promptForOptional: function() {
    var self = this;
    var prompts = [];
    var optFields = this.getOptional();

    var maxRetriesPrompt = {
      type: 'input',
      name: 'maxRetries',
      message: 'Please enter a maximum number of retries to attempt'
    };

    if (!optFields.maxRetries) prompts.push(maxRetriesPrompt);

    return this.ui.prompt(prompts).then(function(results) {
      results = extend(results, optFields);
      return self.setOptions(results);
    });
  },

  /*
    TODO: Implement. Should save in user's ember-cli project directory
    May want to give user option to save w/ access key and secret
    Perhaps add created file to a .gitignore automatically

    @method saveOptionsFile
    @return Promise -> this.options
  */
  saveOptionsFile: function() {
    var options = this.options;
    return options;
  },

  /*
    used to se the options hash for S3 instance.
    Order of precedence:
    1. command line options (e.g. `--aws-bucket=my-bucket`)
    2. process.env variables (e.g. `process.env.AWS_ACCESS_KEY_ID`)
    3. s3Options from package.json
    4. values manually entered in CLI prompt

    @method setOptions
    @param {Object} options The options to be merged into `this.options`
    @return {Object}
  */
  setOptions: function(options) {
    options = options || {};
    return extend(this.options, options);
  }

});
