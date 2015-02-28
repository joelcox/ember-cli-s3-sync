var stripAnsi = require('strip-ansi');
var through   = require('through');

module.exports = MockUI;

function MockUI(){
  this.input = '';
  this.output = '';
  this.escaped = '';

  this.inputStream = through(function(data) {
    this.input += data;
  }.bind(this));

  this.outputStream = through(function(data) {
    data = data || '';
    this.escaped += stripAnsi(data);
    this.output += data;
  }.bind(this));
}

MockUI.prototype.writeLine = function(val) {
  this.outputStream.write(val);
}
