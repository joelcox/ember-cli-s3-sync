'use strict';

var assert    = require('assert');
var command = require('../../../lib/utils/command');

describe('Command', function() {
  var dummyCommand = ' echo "command test" ';

  var dummyIncludes = ['foo', 'falsy', 'num'];

  var dummyIncludesTwo = ['truthy', 'someOption', 'nonExistent'];

  var dummyOptions = {
    foo: 'bar',
    truthy: true,
    falsy: false,
    someOption: 'i am spacey',
    num: 24
  };

  it('Base command is trimmed', function() {
    var actual = command.build(dummyCommand);
    var expect = 'echo "command test"';

    assert.equal(actual, expect);
  });

  it('Builds properly formatted command with existent, falsy, and Number Type cli-arguments', function() {
    var actual = command.build(dummyCommand, dummyOptions, dummyIncludes);
    var expect = 'echo "command test" --foo bar --num 24';

    assert.equal(actual, expect, 'Command formatted correctly');
  });

  it('Builds properly formatted command with truthy, string, and ignores non-existent cli options', function() {
    var actual = command.build(dummyCommand, dummyOptions, dummyIncludesTwo);
    var expect = 'echo "command test" --truthy --some-option "i am spacey"';

    assert.equal(actual, expect, 'Command formatted correctly');
  });

});
