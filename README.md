# Ember-cli-s3-sync
This is a WIP. However it does work as stands for uploading your /dist directory to specified bucket. Still -use at your own risk :)

## TODO
- [ ] write tests
- [ ] write documentation for each function
- [ ] write documentation describing flow, configurable options, general how to use
- [ ] deal with errors in conventional way (however ember-cli deals with them);
- [ ] ability to save config file as `config-s3.json` in project's directory
- [ ] probably add `config-s3.json` to .gitignore
- [ ] ability to specify optional params in `config-s3.json` to be prompted for
- [ ] ability to sync individual files to s3 bucket
- [ ] ability to create bucket if specified bucket doesn't exist
- [ ] ability to authenticate using IAM roles
- [ ] ability to do a dryrun
- [ ] ability to skip build task and just deploy a specified directory
- [ ] update s3 with file's ContentMD5, preferrably async after upload



## Install
* `npm install ember-cli-s3-sync --save-dev`
* `npm install`

## Using with your AWS creds
  This addon uses [`aws-sdk`](https://github.com/aws/aws-sdk-js) so you get some pretty stable behavior when making requests to S3. AWS credentials can be provided in several ways, hopefully satisfying most development environments. Listed below is the order of preference for AWS credentials

Anything included as a command line argument is king of the hill:
  1. `ember deploy:s3 --awsSecret=my-secret --awsKey=my-cool-key`
  2. shared credentials file at [~/.aws/credentials file.](http://blogs.aws.amazon.com/security/post/Tx3D6U6WSFGOK2H/A-New-and-Standardized-Way-to-Manage-Credentials-in-the-AWS-SDKs)
  3. these shell environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  4. config-s3.json

  ```
    {
      "options": { "accessKeyId": "mycoolkey", "secretAccessKey": "secretsarecool" }
    }
  ```

**note** if key & secret aren't found at any of the checks above then you will be prompted for credentials -blocking the deploy (keep this in mind if using with automated/continuous deployment systems).

## How to use
`ember deploy:s3 --environment=development --awsKey=heybob --awsSecret=asdfasdf --awsBucket=buckets-o-fun`
  - this builds a development version of your app and deploys all files in the `/dist` directory to the S3 bucket "buckets-o-fun"

`ember deploy:s3`
  - this will build development version of your app and prompt you for awsKey, awsSecret, and awsBucket

possible cli arguments:
  - `environment` (optional) uses app's default
  - `outputPath` (optional) uses app's default `/dist`
  - `awsKey` (required. will prompt if not provided as cli arg)
  - `awsSecret` (required. will prompt if not provided as cli arg)
  - `awsBucket` (required. will prompt if not provided as cli arg)
  - `awsRegion` (optional. will verify the specified region with aws)

## Configuring deployment
  - **config-s3.json**
  - WIP
