
var fs = require('fs');

var make = function() {
  this.lines = [];
};

make.prototype = {
  insertTask: function(phony, taskName, deps, commands) {
    var dep = '';
    deps.forEach(function(d) {
      dep += (d + ' ');
    });
    var command = '';
    commands.forEach(function(c) {
      command += ('\n\t' + c);
    });
    this.lines.push('\n\n' +
      (phony ? ('.PHONY: ' + taskName + '\n') : '') +
      taskName + ': ' +
      dep + command);

  },

  writeMk: function(path) {
    var content = '';
    this.lines.forEach(function(line) {
      content += line;
    });
    fs.writeFileSync(path, content);
  }
};


exports.make = make;