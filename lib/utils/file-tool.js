var fs = require('fs');

module.exports.addToGitignore = function(toAdd, rootPath) {
  console.log(toAdd);
  console.log(rootPath);
}

module.exports.requireSilent = function(path) {
  try {
    var exists = fs.realpathSync(path);
    if (exists) {
      return require(path);
    }
  } catch(err) {}
}
