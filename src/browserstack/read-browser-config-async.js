const readFileAsync = require('../files/read-file-async');
const path = require('path');
const appDir = path.dirname(require.main.filename);

const readBrowserConfigAsync = async () => {
  const configPath = `${appDir}/.screenshot-flow/browser_settings.json`
  console.log('readConfigFile from path: ', configPath);
  const configJson = await readFileAsync(configPath);
  const config = JSON.parse(configJson);
  return config;
}

module.exports = readBrowserConfigAsync;
