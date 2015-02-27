# ember-cli-s3-sync Changelog

### 0.0.8
* [FEATURE] specify multiple default cli-args inside `includeOptions` Array
* [BREAKING ENHANCHEMENT] cli-args for custom commands are escaped using a proper tool [shell-escape](https://github.com/xxorax/node-shell-escape). cli-args are no longer always wrapped in double quotes
* [TESTS] add tests for formatting a custom command

### 0.0.6
* [FEATURE] new cli-arg 'prepend-path' allows you to specify a subdirectory in an s3 bucket to put assets

### 0.0.5

* [FEATURE] allow default cli-args when running custom scripts during deploy process

### 0.0.4

This release introduces better formatted for running extra-step commands and more test coverage.

* [BREAKING ENHANCEMENT] command line arguments are formatted in a more commonly supported way (no more = signs)
* [TESTS] command formatting and running extra-steps
* [MAINT] fix typos and added some documentation/commenting
