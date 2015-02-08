'use strict';

var assert          = require('assert');

describe('models/s3.js', function() {
  var S3      = require('../../../lib/models/s3');
  var options = {
    region: "us-east-1",
    maxRetries: 2,
    sslEnabled: true
  };

  var s3 = new S3(options);

  it('should create instance of S3 object', function() {

    assert.equal(s3.config.maxRetries, options.maxRetries, "s3 has correct maxRetries options");
    assert.equal(s3.config.region, options.region, "s3 has correct region option");
    assert.equal(s3.config.sslEnabled, options.sslEnabled, "s3 has correct sslEnabled options");

  });

});
