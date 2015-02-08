var through = require('through');

module.exports = MockUI;

function MockUI(){
  this.output = '';

  this.inputStream = through();

  this.outputStream = through(function(data) {
    this.output += data;
  });
}

MockUI.prototype.writeLine = function(val) {
  this.outputStream.write(val);
}
