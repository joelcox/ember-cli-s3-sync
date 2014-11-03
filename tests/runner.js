// https://github.com/stefanpenner/ember-cli/blob/e505b9ed6043a8a8f9fd3a05e064d5942a232067/tests/runner.js
'use strict';

var glob = require('glob');
var Mocha = require('mocha');

var mocha = new Mocha({
  reporter: 'spec'
});

var arg = process.argv[2];
var root = 'tests/{unit,acceptance}';

function addFiles(mocha, files) {
  glob.sync(root + files).forEach(mocha.addFile.bind(mocha));
}

addFiles(mocha, '/**/*-test.js');

if (arg === 'all') {
  addFiles(mocha, '/**/*-slow.js');
}

mocha.run(function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  });
});
