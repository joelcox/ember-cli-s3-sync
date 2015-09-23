# ember-cli-s3-sync Changelog

### 0.0.11
* [FEATURE] allow setting of environment variables. Useful for resetting (local copies of) global variables that each child process gets. e.g.
**extraSteps**, **build**, and **deploy** all run in child processes with a copy of the parent shell's environment variables. This feature allows you to modify
the child_process' copy of those variables without modifying the parent process environment variables.

### 0.0.10
* [MAINT] removed `async` module and use a simpler approach for uploading files consecutively.
* [MAINT] added a hardcoded timeout of 30 seconds that prints out the file attempting to be uploaded.<br>
        How to handle this is still up in the works. Possible behavior:
          - Skip file and add it to end of queue (unless it resolved in meantime)
          - Cancel entire build ?
          - Retry upload right away (Can you cancel an initiated upload to S3?)

### 0.0.9
* [BUGFIX] concurrency was lowered to 1 at a time for uploading files to s3

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
