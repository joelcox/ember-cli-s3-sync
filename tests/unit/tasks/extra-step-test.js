'use strict';

var assert    = require('assert');
var extraStep = require('../../../lib/tasks/extra-step');
var MockUI    = require('ember-cli/tests/helpers/mock-ui');

describe('Extra Step', function() {
  var ui;

  var dummySteps = [
    { command: 'echo "command number 1"' },
    { command: 'echo "command number 2"' },
    { command: 'echo "command number 3"' }
  ];

  var dummyCommands = [
    'echo "command number 1"',
    'echo "command number 2"',
    'echo "command number 3"'
  ];

  var failingStep     = [ { command: 'exit 1', fail: true } ];

  var nonFailingStep  = [ { command: 'exit 1', fail: false } ];

  var singleFailingStep = [ nonFailingStep[0], failingStep[0], nonFailingStep[0] ];

  var dummyOptions = {
    foo: 'bar',
    truthy: true,
    falsy: false,
    someOption: 'i am a string',
    num: 24
  };

  var dummyStepsWithOptions = [
    {
      command: 'echo "command number 4"',
      includeOptions: ['foo', 'falsy', 'num']
    },
    {
      command: 'echo "command number 5"',
      includeOptions: ['truthy', 'someOption', 'nonExistent']
    }
  ];

  var dummyCommandsWithOptions = [
    "echo \"command number 4\" --foo bar --num 24",
    "echo \"command number 5\" --truthy --some-option 'i am a string'",
  ];

  beforeEach(function() {
    ui = new MockUI;
  });

  it('Runs an array of commands passed to it', function() {
    return extraStep(dummySteps, dummyOptions, ui).then(function(result) {
      assert.deepEqual(result, dummyCommands, 'Correct commands were run.');
    }, function(error) {
      assert.ok(false, 'An error occurred');
    });
  });

  it('The proper commands are built and run', function() {
    return extraStep(dummyStepsWithOptions, dummyOptions, ui).then(function(result) {
      assert.deepEqual(result, dummyCommandsWithOptions, 'Correct commands were built and run.');
    }, function(error) {
      assert.ok(false, 'An error occurred');
    });
  });

  it('Fail-safe command, with non 0 exit code, returns rejected promise', function() {
    return extraStep(failingStep, null, ui).then(function(result) {
      assert.ok(false, 'steps should have failed.');
    }, function(err) {
      assert.ok(true, 'steps failed as expected.');
    });
  });

  it('Fail-friendly command, with non 0 exit code, returns resolved promise', function() {
    return extraStep(nonFailingStep, null, ui).then(function(result) {
      assert.ok(true, 'steps kept running after failed command, as expected.');
    }, function(err) {
      assert.ok(false, 'Steps did not continue running as expected');
    });
  });

});
