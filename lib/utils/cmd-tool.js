'use strict';

var Promise = require('../ext/promise');
var dargs   = require('dargs');
var chalk   = require('chalk');
var exec    = require('child_process').exec;

/*
  merges objects like `extend` except handles Array properties in special way.
  Properties that are Arrays are merged instead of overwritten

  @method merge
  @param {Object...} Modifies and returns the first argument;
  @private
  @return {Object}
*/
function merge() {
  var length = arguments.length;
  var i, key, copy, value, arrayAsValue;
  var obj = arguments[0] || {};

  for (i = 1; i < length; i++) {
    copy = arguments[i];

    if (copy == null) { continue; }

    for (key in copy) {
      value = copy[key];

      // combine arrays
      if (Array.isArray(obj[key]) && Array.isArray(value) ) {
        obj[key] = obj[key].concat(value);

      // add to array
      } else if (Array.isArray(obj[key]) && 'string' === typeof value) {
        obj[key].push(value);

      // add to array without modifying copy's array
      } else if ('string' === typeof obj[key] && Array.isArray(value) ) {
        arrayAsValue = value.slice()
        arrayAsValue.push(obj[key]);
        obj[key] = arrayAsValue;

      // simple override
      } else if ('undefined' !== typeof value) {
        obj[key] = value;
      }
    }
  }
  return obj;
}

/*
 *  Turns an array of `key=value` into proper command-line arguments and flags.
 *  `['foo=bar', 'header=x-update: 1', '--truthy']` becomes:
 *  `--foo bar --header "x-update: 1" --truthy`
 *
 *  @method formatArguments
 *  @param {Array} args An array of `key=value` pairs.
 *  @private
 *  @return {String} command line arguments
 *
 */
function formatArguments(args) {
  args = args || [];
  var formattedArgs = [];
  var useQuotes = false;

  args.forEach(function(arg) {
    useQuotes = /\s/.test(arg);

    arg = arg.replace(/\=/, function() {
      return useQuotes ? ' "' : ' ';
    });

    arg = useQuotes ? arg + '"' : arg;

    formattedArgs.push(arg);
  });

  return formattedArgs.join(' ');
}

/*
 *  Considers any default hashes, from the `includes` Array, to build the
 *  hash of all available options. The actual supplied cli-arguments
 *  (the ones you types into the shell) take precedence and are merged into the defaults.
 *
 *  @method buildOptionsWithDefaults
 *  @param {Object} options
 *  @param {Array} includes
 *  @return {Object} a new options hash with default options merged in
 *
 */
function optionsWithDefaults(options, includes) {
  includes = includes || [];
  var opts = {};
  var key;

  includes.forEach(function(arg) {
    if ('string' === typeof arg) {
      return;
    }

    for (key in arg) {
      opts[key] = arg[key];
    }

  });
  return merge(opts, options);
}

/*
 *  Returns a new Array where all elements are strings.
 *  Default hashes are replaced with their key. For example:
 *  `['foo', { myOption: 'my value' }]` becomes:
 *  `['foo', 'myOption']`
 *
 *  @method buildOptionsWithDefaults
 *  @param {Object} options
 *  @param {Array} includes
 *  @return {Object} a modified options hash with default options merged in
 *
 */
function includesWithDefaults(includes) {
  includes = includes || [];
  var key;
  var incl = [];

  includes.forEach(function(arg, i) {
    if ('string' === typeof arg) {
     return incl.push(arg);
    }

    for (key in arg) {
      incl.push(key);
    }
  });

  return incl;
}

/*
 *  @method build
 *  @param {String} command The base command to run
 *  @param {Object} options Available options
 *  @param {Array} include The options to include
 *  @return {String} Formatted command line argument
 *
 */
function build(command, options, includes) {
  if (!command) {
    return;
  }

  includes = includes || [];
  options = options || {};
  command = command.trim();

  var opts = optionsWithDefaults(options, includes);
  var incl = includesWithDefaults(includes);
  var args = dargs(opts, [], incl);

  var formattedArgs = formatArguments(args);

  command += !!formattedArgs ? ' ' + formattedArgs : '';

  return command;
}

/*
 *  @method run
 *
 *  @param {String} command The command to be run
 *  @param {Object} ui The instance that handles stdin/stdout
 *
 */
function run(command, ui) {
  return new Promise(function(resolve, reject) {
      if (!command) {
        return resolve('No command found');
      }

      ui.writeLine(chalk.cyan(command));

      var step = exec(command, {
        cwd: process.cwd()
      }, function(err) {
        if (err !== null) {
          return reject(err);
        }
        return resolve(command);
      });

      step.stdout.pipe(ui.outputStream, {end: false});
    });
}

module.exports = {
  run: run,
  build: build
}
