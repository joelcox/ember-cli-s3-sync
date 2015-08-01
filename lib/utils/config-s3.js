'use strict';

var CoreObject  = require('core-object');
var extend      = require('extend');
var chalk       = require('chalk');
var path        = require('path');
var fs          = require('fs');
var Promise     = require('ember-cli/lib/ext/promise');
var openFile    = Promise.denodeify(fs.open);

function Config() {
  CoreObject.apply(this, arguments);
}
Config.__proto__ = CoreObject;

module.exports = Config.extend({

  /**
   *  Holds the s3 options hash that gets used to build the s3
   *  instance from aws-sdk's S3 class
   *
   *  @property options
   *  @type {Object}
   */
  options: {},

  /**
   *  Holds options set by methods in {{crossLink lib/utils/config-s3}}{{/crossLink}}.
   *  Eventually this gets merged into and overwrites
   *  any options defined in config-s3.js
   *
   *  @property _options
   *  @type {Object}
   *  @private
   */
  _options: {},

  /**
   *  Kicks off the process of building options for the s3 instance.
   *  User will be prompted for any required fields that are missing.
   *  It considers the following places when building the options object:
   *  1. ~/.aws/credentials file
   *  2. Environment variables:
   *    ```
   *      process.env.AWS_ACCESS_KEY_ID
   *      process.env.AWS_SECRET_ACCESS_KEY
   *    ```
   *  3. available CLI options for `ember deploy:s3`
   *    ```
   *    --awsKey
   *    --awsSecret
   *    --awsBucket
   *    --awsRegion
   *    ```
   *  4. options from project-path/config-s3.json
   *    ```javascript
   *    {
   *      "options": {
   *        "accessKeyId": "my-access-key",
   *        "secretAccessKey": "my-secret",
   *        "region": "us-east-1",
   *        "maxRetries": 2,
   *        "sslEnabled": true,
   *        "params": {
   *          "Bucket": "my-bucket"
   *        }
   *      }
   *    }
   *    ```
   *  @method getOptions
   *  @return {Promise} `options` are passed into the resolved promise.
   */
  getOptions: function() {
    var self = this;

    return this.checkSharedCreds()
      .then(function(options) { return self.promptForRequired(); })
      .then(function(options) { return self.promptForOptional(); })
      .then(function(options) { return self.mergeOptions(options); });
  },

  /**
   *  checks HOME_DIR/.aws/credentials for an aws credentials file.
   *  [create shared credential file](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Creating_the_Shared_Credentials_File)
   *
   *  @method checkSharedCreds
   *  @return {Promise}
   */
  checkSharedCreds: function() {

    // special case: skip checking sharedCred if --awsKey or --awsSecret given as CLI option
    if (this.commandOptions.awsKey || this.commandOptions.awsSecret) {
      return this.promptForKeys();
    }

    var self = this;
    var ui = this.ui;
    var homeDir = process.platform === 'win32'
        ? process.env.HOMEPATH || process.env.USERPROFILE
        : process.env.HOME;

    var credFilePath = path.join(homeDir, '.aws', 'credentials');

    return openFile(credFilePath, 'r').then(function(fd) {
      ui.write(chalk.green('AWS shared credentials found: ') + credFilePath + '\r\n');

      if (self.config.promptCredFile) {
        return self.promptCredFile();
      }

    }, function(err) {
      ui.write(chalk.yellow('AWS shared credentials not found: ') + credFilePath + '\r\n');
      return self.promptForKeys();
    });
  },

  /**
   *  Prompts user whether or not to use the found AWS shared
   *  credentials file. This can be silenced from config-s3.json
   *  file using the option `promptCredFile`. If no (n) then user
   *  will be prompted to provide keys, unless they exist as
   *  values in `process.env`(shell env). The values looked for
   *  are `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   *
   *  @method promptCredFile
   */
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
        return self._options;
      }

    });
  },

  /**
   *
   *
   *  @method getEnvKeys
   *  @return {Object} `{accessKeyId: 'ur-key', secretAccessKey: 'ur-secret'}`
   */
  getEnvKeys: function() {
    var key = this.commandOptions.awsKey
      || process.env.AWS_ACCESS_KEY_ID
      || this.options.accessKeyId;
    var secret = this.commandOptions.awsSecret
      || process.env.AWS_SECRET_ACCESS_KEY
      || this.options.secretAccessKey;

    return {
        accessKeyId: key,
        secretAccessKey: secret
      };
  },

  /**
   *
   *
   *  @method promptForKeys
   *  @return {Promise} `options` are passed into the resolved promise.
   */
  promptForKeys: function() {
    var self = this;
    var prompts = [];
    var envKeys = this.getEnvKeys();

    var keyPrompt = {
      type: 'input',
      name: 'accessKeyId',
      default: envKeys.accessKeyId,
      message: 'Please enter your AWS access key id'
    };

    var secretPrompt = {
      type: 'input',
      name: 'secretAccessKey',
      default: envKeys.secretAccessKey,
      message: 'Please enter your AWS secret access key'
    };

    if (!envKeys.accessKeyId) prompts.push(keyPrompt);
    if (!envKeys.secretAccessKey) prompts.push(secretPrompt);

    return this.ui.prompt(prompts)
      .then(function(results) {
        results = extend(envKeys, results);
        return extend(true, self._options, results);
      });
  },

  /**
   *
   *
   *  @method getRequired
   *  @return {Object} `{ awsBucket: 'ur-bucket', region: 'ur-region'}`
   */
  getRequired: function() {
    var bucket = this.commandOptions.awsBucket
        || this.options && this.options.params.Bucket;
    var region = this.commandOptions.awsRegion
        || this.options && this.options.region;

    return {
        awsBucket: bucket,
        region: region,
      };
  },

  /**
   *
   *
   *  @method promptForRequired
   *  @return {Promise} `options` are passed into the resolved promise.
   */
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
      message: 'Please enter a region or leave blank if not known'
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
        };
        return extend(true, self._options, options);
      });
  },

  /**
   *  Reads `additionalOptions` from config-s3.js
   *  All additional options are treated as prompts. However,
   *  values in config-s3.js `options` hash take precedence.
   *  This means that if there exists a key in the `options`
   *  hash with the same `name` as an additional option,
   *  then the additional option prompt will be ignored.
   *
   *  @method promptForOptional
   *  @return {Promise} `options` are passed into the resolved promise.
  */
  promptForOptional: function() {
    var self = this;
    var prompts = [];
    var additionalOptions = this.config.additionalOptions || [];
    additionalOptions.forEach(function(prompt) {
      if ('undefined' === typeof self.options[prompt.name]) {
        prompts.push(prompt);
      }
    });
    return this.ui.prompt(prompts).then(function(results) {
      return extend(true, self._options, results);
    });
  },

  /**
   *
   *  Follows the 'define it where you need it' principle.
   *  i.e.
   *    - If you want to be prompted for s3 options, don't define them anywhere.
   *    - If you want an s3 option to be pulled from a CLI options, define it there
   *      (this is the only case where an option will overwrite a prev. defined one).
   *    - If you want an s3 options to come from congig-s3.json, only define it there.
   *    - If you want to be prompted for an option, define it in the `additionalOptions`
   *      hash in config-s3.js
   *
   *  Order of how options are merged in (later merged values overwrite earlier ones):
   *  1. command line options (e.g. `--aws-bucket=my-bucket`)
   *  2. process.env variables (e.g. `process.env.AWS_ACCESS_KEY_ID`)
   *  3. options from config-s3.json
   *  4. values manually entered from a CLI prompt
   *
   *
   *  **note** once an option is found, you normally won't be prompted to overwrite it.
   *  If you want to be prompted then you must:
   *    - Define a prompt in the `additionalOptions` hash **and** make sure it's not
   *      included in `options` hash of *deploy/config.js*
   *
   *  @method mergeOptions
   *  @param {Object} options The options to be merged into `this.options`. Passed in options will override existing ones with same key.
   *  @return {Object}
   */
  mergeOptions: function(options) {
    options = options || this._options;
    var prependPath;

    if (this.config.verbose) {
      options.logger = this.ui.outputStream;
    }

    if (prependPath = this.commandOptions.prependPath || this.config.prependPath) {
      options.prependPath = prependPath;
    }

    return extend(true, this.options, options);
  }

});
