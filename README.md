# Ember-cli-s3-sync

## Install
* `npm install ember-cli-s3-sync --save-dev`
* `npm install`

## Authenticating with S3
This addon uses [`aws-sdk`](https://github.com/aws/aws-sdk-js) for communicating with Amazon S3.  You can provide authentication credentials in the following ways (listed in order of precedence):

  1. `ember deploy:s3 --aws-secret=my-secret --aws-key=my-cool-key`
  2. shared credentials file at [~/.aws/credentials file.](http://blogs.aws.amazon.com/security/post/Tx3D6U6WSFGOK2H/A-New-and-Standardized-Way-to-Manage-Credentials-in-the-AWS-SDKs)
  3. these shell environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  4. deploy/config.js

  ```
    {
      "options": { "accessKeyId": "mycoolkey", "secretAccessKey": "secretsarecool" }
    }
  ```

**note** if key & secret aren't found at any of the checks above then you will be prompted for credentials -blocking the deploy (keep this in mind if using with automated/continuous deployment systems).

## How to use
`ember deploy:s3 --environment=development --aws-key=12345 --aws-secret=asdfasdf --aws-bucket=buckets-o-fun`
  - this builds a development version of your app and deploys all files in the `/dist` directory to the S3 bucket "buckets-o-fun"

`ember deploy:s3`
  - this will build development version of your app and prompt you for `awsKey`, `awsSecret`, and `awsBucket`

possible cli arguments:
  - `environment` (optional. uses app's default. Passed into *deployl/config.js*)
  - `output-path` (optional. uses app's default `/dist`)
  - `aws-key` (required. will prompt if not found)
  - `aws-secret` (required. will prompt if not found)
  - `aws-bucket` (required. will prompt if not provided as cli arg or found in *deploy/config.js*)
  - `aws-region` (optional. will be verified and updated if necessary during deploy process)
  - `skip-build` (optional. will skip the build, deploying whatever is in `/dist`)

**notes** camelCase args are okay but they'll be converted to their dasherized version.

## Configuring deployment
The `environment` is passed into config file, which returns an object containing deploy configuration options.

And here are the pieces to [**deploy/config.js**:](https://github.com/Vestorly/ember-cli-s3-sync/blob/master/blueprints/config-s3/files/deploy/config.js)
#### ember-cli-s3-sync Options
```javascript
{
  ...
  environment: 'development', // not used, but good practice to name the config incase you have several
  promptCredFile: false, // prompts whether or not to use AWS cred file, if one is found.
  verbose: false, // turns on AWS-SDK verbose flag. May be useful for troubleshooting.
  ...
}
```

#### [S3 Options:](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property)
```javascript
{ 
  ...
  options: {
    region: 'us-east-1',
    maxRetries: 3,
    sslEnabled: true,
    params: {
      Bucket: 'my-bucket' // yes that's a capital B
    },
  ...
}
```

#### Prompt for additional Options:
If you want the deploy process to prompt a user for additional options to be merged in for instantiating the S3 Object:
Uses the [inquirer node module](https://github.com/SBoudrias/Inquirer.js).
```javascript
{
  ...
  additionalOptions: { 
    type: 'input',
    name: 'maxRetries',
    'default': 2,
    message: 'Please enter a maximum number of retries to attempt when uploading a file',
    validate: function(value) {
      if ('number' !== typeof value) {
        return false;
      }
      return value;
    }
  },
  ...
}
```

#### Deploy Steps:
You can run scripts throughout the deploy process. These scripts must exit their process for the deploy to continue running.
`beforeBuild` and `afterBuild` are *not* run if you use the `--skip-build` flag.
```javascript
{
  ...
  beforeBuild: [
    {
      command: 'curl -I http://my-site.nyc?deploy=start',
      includeOptions: ['some-option'], // cli args from `ember deploy:s3 --some-option=hey` to be added to this command
      fail: false // whether a non 0 exit code should halt the deploy process
    }
  ],
  afterBuild: [
    ...
  ],
  beforeDeploy: [
    ...
  ],
  afterDeploy: [
    ...
  ],
  ...
}
```

## TODO
- [ ] 100% test coverage
- [ ] write documentation for each function
- [ ] write documentation describing flow, configurable options, general how to use
- [ ] ability to save config file as `config-s3.json` in project's directory
- [x] ability to generate `config-s3.js` for deploy configuration
- [x] ability to specify optional params in `config-s3.json` to be prompted for
- [ ] ability to sync individual files to s3 bucket
- [ ] ability to create bucket if specified bucket doesn't exist
- [ ] ability to authenticate using IAM roles
- [ ] ability to do a dryrun
- [x] ability to skip build task and just deploy a specified directory
- [ ] update s3 with file's ContentMD5, preferrably async after upload

