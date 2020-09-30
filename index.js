const path = require('path');
const urlUtil = require('url');
const core = require('@actions/core');
const github = require('@actions/github');
const BrowserStack = require("browserstack");


// Utils
const generateScreenshotsAsync = require('./src/browserstack/generate-screenshots-async');
const waitForJobToFinishAsync = require('./src/browserstack/wait-for-job-to-finish-async');
const readBrowserConfigAsync = require('./src/browserstack/read-browser-config-async');
const downloadFile = require('./src/files/download-file');
const ensureDirectory = require('./src/files/ensure-directory');
const findFilesByExtension = require('./src/files/find-files-by-extension');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

const appDir = path.dirname(require.main.filename);

// Constants
const SCREEN_SHOT_DIRECTORY = `${appDir}/screenshots`;

const action = process.env.NODE_ENV === 'development'
  ? process.env.ACTION
  : core.getInput('action');

const generateScreenshots = async () => {
  let screenshotUrls = process.env.NODE_ENV !== 'development'
    ? core.getInput('screenshot-page-urls')
    : process.env.SCREENSHOT_PAGE_URLS;
  screenshotUrls = screenshotUrls.split(',');

  console.log('Start making screenshots');
  console.log('Browserstack user: ', process.env.BROWSERSTACK_USERNAME);
  console.log('Screenshot urls: ', screenshotUrls);

  if (!screenshotUrls || !screenshotUrls.length) {
    throw new Error('No screenshot urls found');
  }
  if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_PASSWORD) {
    throw new Error('Browserstack USERNAME or PASSWORD not set');
  }

  // Setup browser stack screenshot client
  const browserStackCredentials = {
    username: process.env.BROWSERSTACK_USERNAME,
    password: process.env.BROWSERSTACK_PASSWORD,
  };

  const baseConfig = await readBrowserConfigAsync(appDir);
  if (!baseConfig) throw new Error('Config not found at ./screenshot-flow/browser-settings.json');


  const screenshotConfigs = screenshotUrls.map((url) => {
    const config = { ...baseConfig };
    config.url = url;
    return config;
  });

  console.log(screenshotConfigs);

  const finishedJobs = [];
  for await (const screenshotConfig of screenshotConfigs) {
    console.log('MAKE SCREENSHOT FOR PAGE: ', screenshotConfig);

    const screenshotClient = await BrowserStack.createScreenshotClient(browserStackCredentials);
    const screenshotsJob = await generateScreenshotsAsync(screenshotClient, screenshotConfig);
    const finishedJob = await waitForJobToFinishAsync(screenshotClient, screenshotsJob.job_id);

    finishedJobs.push(finishedJob);
    console.log('FiNISHED SCREENSHOT FOR PAGE: ', screenshotConfig);
  }

  console.log("finishedJob: ", finishedJob);
  core.setOutput("job-result", finishedJob);
}

const downloadScreenshots = async () => {
  console.log('Start downloading screenshots');
  const screenshotJobResultJson = process.env.NODE_ENV !== 'development'
    ? core.getInput('job-result')
    : process.env.SCREENSHOTS_JOB;
  const screenshotJobResults = JSON.parse(screenshotJobResultJson);

  console.log('screenshots: ', screenshotJobResults);

  ensureDirectory(SCREEN_SHOT_DIRECTORY);

  for await (const screenshotJobResult of screenshotJobResults) {
    for await (const screenshot of screenshotJobResult.screenshots) {
      const urlParts = screenshot.image_url.split('/')
      const length = urlParts.length - 1;
      const filename = urlParts[length];

      console.log('Download: ', filename);
      await downloadFile(screenshot.image_url, filename, SCREEN_SHOT_DIRECTORY);
      console.log('Download finished: ', filename);
    }
  }

  const totalImagesDownloaded = screenshotJobResults.reduce((total, job) => {
    return total + job.screenshots.length;
  }, 0);

  console.log(`Finished downloading jobs ${screenshotJobResults.length} totalImages downloaded: ${totalImagesDownloaded}`);
  core.setOutput("screenshots-directory", SCREEN_SHOT_DIRECTORY);
}

const collectGatsbyUrls = () => {
  const domain = process.env.NODE_ENV !== 'development'
    ? core.getInput('website-domain')
    : process.env.WEBSITE_DOMAIN;

  const gatsbyDirectory = process.env.NODE_ENV !== 'development'
    ? core.getInput('gatsby-public-folder')
    : process.env.GATSBY_PUBLIC_FOLDER;

  const absoluteGatsbyPath = path.join(appDir, gatsbyDirectory)
  console.log('START COLLECTING GATSBY URLS');
  console.log('website-domain: ', domain);
  console.log('dir: ', absoluteGatsbyPath);

  // Find files by extension recursively
  const htmlFilesRaw = findFilesByExtension(absoluteGatsbyPath, 'html');
  console.log('html files found: ', htmlFilesRaw)

  // Remove base directory from result.
  const urls = htmlFilesRaw
    .map((url) => urlUtil.resolve(domain, url.replace(absoluteGatsbyPath, '')))
    .join(',');

  console.log('html files found: ', urls);
  core.setOutput('urls', urls);
}

const ACTION_HANDLERS = {
  'generate-screenshots': generateScreenshots,
  'download-screenshots': downloadScreenshots,
  'collect-static-gatsby': collectGatsbyUrls
};

(async () => {
  try {
    console.log('Current dir: ', path.dirname(__filename));
    console.log('Action', action)
    const actionHandler = ACTION_HANDLERS[action];
    if (!actionHandler) {
      const possibleActions = Object.keys(ACTION_HANDLERS).join(', ');
      throw new Error(`ActionHandler not found: ${action} possible actions: [${possibleActions}] `);
    }

    await actionHandler();

  } catch (error) {
    core.setFailed(error.message);
  }
})();




    // // `who-to-greet` input defined in action metadata file
    // const nameToGreet = core.getInput('who-to-greet');
    // console.log(`Hello ${nameToGreet}!`);
    // const time = (new Date()).toTimeString();
    // core.setOutput("time", time);
    // // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);
