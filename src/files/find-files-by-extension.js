const path = require('path');
const fs = require('fs');

const findFilesByExtension = (directory, extension, files, result) => {
  files = files || fs.readdirSync(directory);
  result = result || []

  files.forEach((file) => {
    const newBase = path.join(directory, file);
    if (fs.statSync(newBase).isDirectory()) {
      result = findFilesByExtension(newBase, extension, fs.readdirSync(newBase), result);
    }
    else {
      if (file.substr(-1 * (extension.length + 1)) === '.' + extension) {
        result.push(newBase);
      }
    }
  });

  return result;
}

module.exports=findFilesByExtension;
