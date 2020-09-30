const fs = require('fs');

const readFileAsync = async (path, encoding = 'utf8') => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (error, data) => {
      if (error) return reject(error);
      return resolve(data);
    });
  });
}

module.exports = readFileAsync;
