'use strict';

var assert    = require('assert');
var tool = require('../../../lib/utils/s3-tool');
var MockUI    = require('../../helpers/mock-ui');
var fileTool = require('../../../lib/utils/file-tool');

describe('S3 Tool', function() {

  var files;
  var config = {
    options: {
      region: 'us-east-1',
      maxRetries: 2,
      sslEnabled: true,
      params: {
        Bucket: 'ember-cli-deploy-test'
      },
      objectParams: {
        CacheControl: 'max-age=3600, public',
      },
    }
  };

  beforeEach(function(done) {

    fileTool.readDirectory('./tests/dummy').then(function(dir) {
      files = dir;
      done();
    });

  });

  it('Builds file parameters based on object parameters in the configuration', function(done) {

    var actual = tool.buildFileParameters(files[0], config);
    var expect = { Key: '.jshintrc',
      ContentLength: 538,
      ACL: 'public-read',
      CacheControl: 'max-age=3600, public',
      ContentType: 'text/plain'
    };

    assert.deepEqual(actual, expect, 'Objects params build correctly');
    done();

  });

  it('Builds file parameters when object parameters are not specified in the config', function(done) {

    var actual = tool.buildFileParameters(files[0], {'options': {}});
    var expect = { Key: '.jshintrc',
      ContentLength: 538,
      ACL: 'public-read',
      CacheControl: 'max-age=31536000, public',
      ContentType: 'text/plain'
    };

    assert.deepEqual(actual, expect, 'Objects params build correctly without config');
    done();

  });

});
