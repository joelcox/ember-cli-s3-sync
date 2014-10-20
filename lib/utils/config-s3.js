'use strict';

var CoreObject  = require('core-object');
var extend      = require('extend');
var chalk       = require('chalk');
var path        = require('path');
var fs          = require('fs');
var config      = require('../../package.json')['config'];
var Promise     = require('../ext/promise');
var openFile    = Promise.denodeify(fs.open);

function Config() {
  CoreObject.apply(this, arguments);
}
Config.__proto__ = CoreObject;

module.exports = Config.extend({

  /*
    TODO: retrieve config from a config-s3.json object.
    Holds the options that will be passed to construct the S3 instance.
    The default options come from `config.options` in package.json
    @property options
    @default `config.options`
    @type {Object}
  */
  options: config.options,

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
    Kicks off the process of building options for the s3 instance.
    User will be prompted for any required fields that are missing.
    It considers the following places when building the options object:
    1. ~/.aws/credentials file
    2. Environment variables:
      ```
        process.env.AWS_ACCESS_KEY_ID
        process.env.AWS_SECRET_ACESS_KEY
      ```
    3. Command line args that follow `ember deploy:s3`
      ```
      awsKey=my-special-key
      awsSecret=my-secret
      awsBucket=my-bucket
      awsRegion=us-east-1
      ```
    4. options from config-s3.json
      ```javascript
      {
        "name": "ember-cli-s3-sync",
        "config": {
          "accessKeyId": "my-access-key",
          "secretAccessKey": "my-secret",
          "region": "us-east-1",
          "maxRetries": 2,
          "sslEnabled": true,
          "params": {
            "Bucket": "my-bucket"
          }
        }
      }
      ```

    @method buildOptions
    @return Promise -> resolved promise returns options object
  */
  buildOptions: function() {
    var self = this;

    if (config.verboseLogging) {
      this.options.logger = this.ui.outputStream;
    }

    return this.checkSharedCreds()
      .then(function(options) { return self.promptForRequired(); })
      .then(function(options) { return self.promptForOptional(); })
      .then(function(options) { return self.saveConfigFile(); });
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
      ui.write(chalk.green('AWS shared credential found: ') + credFilePath + '\r\n');

      if (config.credFilePrompt) {
        return self.promptCredFile();
      }

    }, function(err) {
      ui.write(chalk.green('AWS shared credential not found: ') + credFilePath + '\r\n');
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
      || this.options.accessKeyId;
    var secret = this.commandOptions.awsSecret
      || process.env.AWS_SECRET_ACESS_KEY
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
      || this.options.params.Bucket
    var region = this.commandOptions.awsRegion
      || this.options.region

    return {
        awsBucket: bucket,
        region: region,
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
        var options = {
          region: results.region,
          params: {
            Bucket: results.awsBucket
          }
        }
        return self.setOptions(options);
      });
  },

  getOptional: function() {
    var max = this.options.maxRetries
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
    Perhaps add the created file to a .gitignore automatically

    @method saveConfigFile
    @return Promise -> this.options
  */
  saveConfigFile: function() {
    var options = this.options;
    return options;
  },

  /*
    used to set the options hash for S3 instance.
    Order of precedence:
    1. command line options (e.g. `--aws-bucket=my-bucket`)
    2. process.env variables (e.g. `process.env.AWS_ACCESS_KEY_ID`)
    3. options from config-s3.json
    4. values manually entered from a CLI prompt

    @method setOptions
    @param {Object} options The options to be merged into `this.options`. Passed in options will override existing ones with same key.
    @param {Object} params An object to be passed as params (inside options object) to construct an s3 instance
    @return {Object}
  */
  setOptions: function(options) {
    options = options || {};
    return extend(true, this.options, options);
  }

});
