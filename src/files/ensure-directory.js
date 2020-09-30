const fs = require('fs');

/**
 * Make sure that the directory exists. If it doesn't
 * exist create it.
 */
 const ensureDirectory = (directory) => {
  if (!fs.existsSync(directory)){
    fs.mkdirSync(directory);
  }
 }

 module.exports=ensureDirectory;
