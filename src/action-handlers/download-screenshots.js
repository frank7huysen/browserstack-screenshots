const path = require('path');
const core = require('@actions/core');

// Utils
const downloadFile = require('../files/download-file');
const ensureDirectory = require('../files/ensure-directory');

// Constants
const appDir = path.dirname(require.main.filename);
const SCREEN_SHOT_DIRECTORY = `${appDir}/screenshots`;

const getTotalImagesDownloaded = (screenshotJobResults) => screenshotJobResults
  .reduce((total, job) => {
    return total + job.screenshots.length;
  }, 0);

const downloadScreenshots = async () => {
  console.log('Start downloading screenshots');
  const screenshotJobResultJson = process.env.NODE_ENV !== 'development'
    ? core.getInput('job-result')
    : process.env.SCREENSHOTS_JOB;
  const screenshotJobResults = JSON.parse(screenshotJobResultJson);

  console.log('screenshots: ', screenshotJobResults);

  ensureDirectory(SCREEN_SHOT_DIRECTORY);

  // Multiple screenshots jobs
  for await (const screenshotJobResult of screenshotJobResults) {

    // Get all screenshots per screenshot job
    for await (const screenshot of screenshotJobResult.screenshots) {
      const urlParts = screenshot.image_url.split('/')
      const length = urlParts.length - 1;
      const fileId = urlParts[length - 1];
      const filename = urlParts[length];
      const fullName = `${fileId}-${filename}`;

      console.log('Download: ', fullName);
      await downloadFile(screenshot.image_url, fullName, SCREEN_SHOT_DIRECTORY);
      console.log('Download finished: ', fullName);
    }
  }

  // Set output
  const totalImagesDownloaded = getTotalImagesDownloaded(screenshotJobResults);
  console.log(`Finished downloading jobs ${screenshotJobResults.length} totalImages downloaded: ${totalImagesDownloaded}`);
  core.setOutput("screenshots-directory", SCREEN_SHOT_DIRECTORY);
}

module.exports = downloadScreenshots;
