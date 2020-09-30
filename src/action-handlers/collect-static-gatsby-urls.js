const path = require('path');
const urlUtil = require('url');
const core = require('@actions/core');

// Utils
const findFilesByExtension = require('../files/find-files-by-extension');

const appDir = path.dirname(require.main.filename);

const collectGatsbyUrls = () => {
  const domain = process.env.NODE_ENV !== 'development'
    ? core.getInput('website-domain')
    : process.env.WEBSITE_DOMAIN;

  const gatsbyDirectory = process.env.NODE_ENV !== 'development'
    ? core.getInput('gatsby-public-folder')
    : process.env.GATSBY_PUBLIC_FOLDER;

  const absoluteGatsbyPath = path.join(appDir, gatsbyDirectory);
  console.log('START COLLECTING GATSBY URLS');
  console.log('website-domain: ', domain);
  console.log('dir: ', absoluteGatsbyPath);

  // Find files by extension recursively
  const htmlFilesRaw = findFilesByExtension(absoluteGatsbyPath, 'html');
  console.log('html files found: ', htmlFilesRaw)

  // Remove base directory from result.
  const urls = htmlFilesRaw
    .map((url) => urlUtil.resolve(domain, url.replace(absoluteGatsbyPath, '')))

  console.log('html files found: ', urls);
  core.setOutput('urls', urls.join(','));
}

module.exports = collectGatsbyUrls;
