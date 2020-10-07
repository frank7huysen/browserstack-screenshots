const path = require('path');
const BrowserStack = require('browserstack');
const core = require('@actions/core');

// Utils
const generateScreenshotsAsync = require('../browserstack/generate-screenshots-async');
const waitForJobToFinishAsync = require('../browserstack/wait-for-job-to-finish-async');
const readBrowserConfigAsync = require('../browserstack/read-browser-config-async');

const appDir = path.dirname(require.main.filename);

// Setup browser stack screenshot client
const browserStackCredentials = {
  username: process.env.BROWSERSTACK_USERNAME,
  password: process.env.BROWSERSTACK_PASSWORD,
};

const mergeConfigPerUrl = (screenshotUrls, baseConfig) => {
  return screenshotUrls.map((url) => {
    const config = { ...baseConfig };
    config.url = url;
    return config;
  });
};

const generateScreenshots = async () => {
  let screenshotUrls =
    process.env.NODE_ENV !== 'development'
      ? core.getInput('screenshot-page-urls')
      : process.env.SCREENSHOT_PAGE_URLS;

  const configDir =
    process.env.NODE_ENV !== 'development'
      ? process.env.GITHUB_WORKSPACE
      : appDir;
  screenshotUrls = screenshotUrls.split(',');

  console.log('Start making screenshots');
  console.log('Config dir: ', configDir);
  console.log('Browserstack user: ', process.env.BROWSERSTACK_USERNAME);
  console.log('Screenshot urls: ', screenshotUrls);

  if (!screenshotUrls || !screenshotUrls.length) {
    throw new Error('No screenshot urls found');
  }
  if (
    !process.env.BROWSERSTACK_USERNAME ||
    !process.env.BROWSERSTACK_PASSWORD
  ) {
    throw new Error('Browserstack USERNAME or PASSWORD not set');
  }

  const baseConfig = await readBrowserConfigAsync(configDir);
  if (!baseConfig)
    throw new Error(
      'Config not found at ./screenshot-flow/browser-settings.json',
    );

  const screenshotConfigs = mergeConfigPerUrl(screenshotUrls, baseConfig);
  console.log(screenshotConfigs);

  const finishedJobs = [];

  for await (const screenshotConfig of screenshotConfigs) {
    console.log('MAKE SCREENSHOT FOR PAGE: ', screenshotConfig);

    const screenshotClient = await BrowserStack.createScreenshotClient(
      browserStackCredentials,
    );
    const screenshotsJob = await generateScreenshotsAsync(
      screenshotClient,
      screenshotConfig,
    );
    const finishedJob = await waitForJobToFinishAsync(
      screenshotClient,
      screenshotsJob.job_id,
    );

    finishedJobs.push(finishedJob);
    console.log('FiNISHED SCREENSHOT FOR PAGE: ', screenshotConfig);
  }

  console.log('finishedJob: ', JSON.stringify(finishedJobs, null, 4));
  core.setOutput('job-result', finishedJobs);
};

module.exports = generateScreenshots;
