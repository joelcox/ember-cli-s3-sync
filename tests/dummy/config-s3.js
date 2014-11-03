'use strict';
// this is your config! have fun with it.

var developmentConfig = {
  "environment": "development",
  "promptCredFile": false,
  "verbose": false,

  /*
    Add additional prompts when building the `options` hash that gets passed into S3 constructor, `new S3(options)`
    The "name" property should mimic the name of the option you'd like to set.
    For a list of possible options see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property

    If you write a prompt for an option that already exists in your `options` hash below, you won't be prompted.
  */
  "additionalOptions": [

    /*
      Uses inquirer to display prompts (same as what ember-cli uses). [inquirer node module](https://github.com/SBoudrias/Inquirer.js)
      Typical format is:
      ```javascript
        {
          "type": "input",
          "name": "myInput",
          "default": "",
          "validate": function(value) {
            value = value || '';
            return value.trim() !== '';
          }
        }
      ```
    */
    { "type": "input", // input |
      "name": "maxRetries",
      "default": 2,
      "message": "Please enter a maximum number of retries to attempt when uploading a file"
    }

  ],

  /*
    run extra steps in your deploy process. Useful for running commands or scripts before/after the build or deploy task.

  */
  "extraSteps": {

    /*
      **not** run if `skip-build` flag is set. `ember deploy:s3 --skip-build`
    */
    "beforeBuild": {
      "command": "",
      "includeOptions": ["environment"],
      "fail": false
    },

    /*
      **not** run if `skip-build` flag is set. `ember deploy:s3 --skip-build`
    */
    "afterBuild": {
      "command": "echo 'hey neighbor'",
      "includeOptions": ["environment"],
      "fail": false
    },

    "beforeDeploy": {
      "command": "echo 'EXTRA STEP: starting deploy'",
      "includeOptions": ["environment", "aws-key", "skip-build"],
      "fail": false
    },

    "afterDeploy": {
      "command": "echo 'EXTRA STEP: done deploying. life's good.",
      "includeOptions": ["environment"],
      "fail": false
    }

  },

  "options": {
    "region": "us-east-1",
    "maxRetries": 2,
    "sslEnabled": true,
    "params": {
      "Bucket": "ember-cli-deploy-test"
    }

  }

}

var productionConfig = {


}

/*
  env gets passed in based on `--environment` flag. Default is 'development'
*/
module.exports = function(env) {
  env = env || 'development';
  return (env === 'development') ? developmentConfig : productionConfig;
}
