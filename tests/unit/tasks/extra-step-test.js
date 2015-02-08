'use strict';

var assert    = require('assert');
// var assert    = require('../../helpers/assert');
var extraStep = require('../../../lib/tasks/extra-step');
var MockUI    = require('../../helpers/mock-ui');

describe('Extra step', function() {
  var ui;
  var dummySteps = [
    {
      command: 'echo "command number 1"',
      includeOptions: [],
      fail: false,
    },
    {
      command: 'echo "command number 2"',
      includeOptions: ['fooBar'],
      fail: false,
    },
    {
      command: 'echo "command number 3"',
      includeOptions: ['foo', 'bar'],
      fail: false
    }
  ];

  var failingStep = [
    {
      command: 'exit 1',
      fail: true
    }
  ];

  var nonFailingStep = [
    {
      command: 'exit 1',
      fail: false
    }
  ];

  var dummyOptions = {
    fooBar: 'A',
    foo: 'B',
    bar: true
  };

  var expected = [
    'echo "command number 1"',
    'echo "command number 2" --foo-bar=A',
    'echo "command number 3" --foo=B --bar'
  ];

  before(function() {
    ui = new MockUI;
  });

  it('Runs an array of commands passed to it', function() {
    return extraStep(dummySteps, dummyOptions, ui).then(function(result) {
      assert.deepEqual(result, expected, 'Correct commands were run.');
    })
    .catch(function(error) {
      assert.ok(false, 'An error occurred');
    });

  });

  it('Steps fail when command runs with non 0 exit code', function() {
    return extraStep(failingStep, null, ui).then(function(result) {
      assert.ok(false, 'steps should have failed.');
    }, function(err) {
      assert.ok(true, 'steps failed as expected.');
    })
  });

  it('Steps do not fail when command runs with non 0 exit code', function() {
    return extraStep(nonFailingStep, null, ui).then(function(result) {
      assert.ok(true, 'steps kept running after failed command, as expected.');
    }, function(err) {
      assert.ok(false, 'Steps did not continue running as expected');
    })
  });

});
