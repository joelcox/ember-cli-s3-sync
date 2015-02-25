'use strict';

var assert    = require('assert');
var command = require('../../../lib/utils/cmd-tool');

describe('Command', function() {
  var dummyCommand = ' echo "command test" ';

  var dummyIncludes = ['foo', 'falsy', 'num'];

  var dummyIncludesTwo = ['truthy', 'someOption', 'nonExistent'];

  // includes are an array with Strings and/or Hashes of default cli-args
  var includesWithDefaults = [
    'foo',
    { truthy: 'yes!' },
    { notProvided: 'i am a default' }
  ];

  var includesWithDuplicates = [
    { cookie: ['session=abcdef'] },
    { header: [ 'Content-Type: text/html', 'Connection: keep-alive' ] },
    { proxyHeader: 'Accept-Encoding: gzip' }
  ];

  var dummyOptions = {
    foo: 'bar',
    truthy: true,
    falsy: false,
    someOption: 'i am spacey',
    num: 24
  };

  var dummyOptionsWithMulti = {
    foo: ['A', 'B', 'C'],
    cookie: ['GMT=-5'],
    header: 'X-Forwarded-For: me.com',
    proxyHeader: ['Host: me.com']
  }

  it('Base command is trimmed', function() {
    var actual = command.build(dummyCommand);
    var expect = 'echo "command test"';

    assert.equal(actual, expect);
  });

  it('Builds properly formatted command with existent, falsy, and Number Type cli-arguments', function() {
    var actual = command.build(dummyCommand, dummyOptions, dummyIncludes);
    var expect = 'echo "command test" ' +
                '--foo bar ' +
                '--num 24';

    assert.equal(actual, expect, 'Command formatted correctly');
  });

  it('Builds properly formatted command with truthy, string, and ignores non-existent cli options', function() {
    var actual = command.build(dummyCommand, dummyOptions, dummyIncludesTwo);
    var expect = 'echo "command test" ' +
                "--truthy " +
                "--some-option 'i am spacey'";

    assert.equal(actual, expect, 'Command formatted correctly');
  });

  it('Builds properly formatted command using options with multiple values', function() {
    var actual = command.build(dummyCommand, dummyOptionsWithMulti, dummyIncludes);
    var expect = 'echo "command test" ' +
                '--foo A ' +
                '--foo B ' +
                '--foo C';

    assert.equal(actual, expect, 'Command formatted correctly');
  });

  it('Builds properly formatted command using default args when no arg is provided and allows overriding a default arg', function() {
    var actual = command.build(dummyCommand, dummyOptions, includesWithDefaults);
    var expect = 'echo "command test" ' +
                '--truthy ' +
                '--not-provided \'i am a default\' ' +
                '--foo bar';

    assert.equal(actual, expect, 'Command formatted correctly');
  });

  it('Builds properly formatted command using multi-value default args', function() {
    var actual = command.build(dummyCommand, {}, includesWithDuplicates);
    var expect = 'echo "command test" ' +
                "--cookie 'session=abcdef' " +
                "--header 'Content-Type: text/html' " +
                "--header 'Connection: keep-alive' " +
                "--proxy-header 'Accept-Encoding: gzip'";

    assert.equal(actual, expect, 'Command formatted correctly');
  });

  it('Correctly handles merging multi-value defaults with multi-value options', function() {
    var actual = command.build(dummyCommand, dummyOptionsWithMulti, includesWithDuplicates);
    var expect = 'echo "command test" ' +
                "--cookie 'session=abcdef' " +
                "--cookie 'GMT=-5' " +
                "--header 'Content-Type: text/html' " +
                "--header 'Connection: keep-alive' " +
                "--header 'X-Forwarded-For: me.com' " +
                "--proxy-header 'Host: me.com' " +
                "--proxy-header 'Accept-Encoding: gzip'";

    assert.equal(actual, expect, 'Command formatted correctly');
  });

});
