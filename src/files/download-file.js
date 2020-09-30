const fetch = require('node-fetch');
const fs = require('fs');

const downloadFile = async (file, filename, directory) => {
  const res = await fetch(file);

  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(`${directory}/${filename}`);

    res.body.pipe(fileStream);
    res.body.on('error', (err) => {
      reject(err);
      throw new Error('ERROR! file saved failed!', err);
    });
    fileStream.on('finish', () => {
      resolve();
    });
  });

}

module.exports = downloadFile;
