# Ember-cli-s3-sync

## TODO
- [ ] write tests
- [ ] write documentation for each function
- [ ] write documentation describing flow, configurable options, general how to use
- [ ] deal with errors in conventional way (however ember-cli deals with them);
- [ ] ability to save config file as `config-s3.json` in cwd
- [ ] probably add `config-s3.json` to .gitignore
- [ ] ability to specify optional params in `config-s3.json` to be prompted for
- [ ] ability to sync individual files to s3 bucket
- [ ] ability to create bucket if specified bucket doesn't exist
- [ ] ability to authenticate using IAM roles
- [ ] ability to do a dryrun
- [ ] update s3 with file's ContentMD5, preferrably async after upload

This README outlines the details of collaborating on this Ember addon.

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
