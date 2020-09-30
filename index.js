const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const BrowserStack = require("browserstack");

// Utils
const generateScreenshotsAsync = require('./src/browserstack/generate-screenshots-async');
const waitForJobToFinishAsync = require('./src/browserstack/wait-for-job-to-finish-async');
const readBrowserConfigAsync = require('./src/browserstack/read-browser-config-async');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

const action = process.env.NODE_ENV === 'development'
  ? process.env.ACTION
  : core.getInput('action');

const generateScreenshots = async () => {
  console.log('Start making screenshots');
  console.log('Browserstack user: ', process.env.BROWSERSTACK_USERNAME);

  if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_PASSWORD) {
    throw new Error('Browserstack USERNAME or PASSWORD not set');
  }

  // Setup browser stack screenshot client
  const browserStackCredentials = {
    username: process.env.BROWSERSTACK_USERNAME,
    password: process.env.BROWSERSTACK_PASSWORD,
  };

  const screenshotConfig = await readBrowserConfigAsync();
  if(!screenshotConfig) throw new Error('Config not found at ./screenshot-flow/browser-settings.json');

  const screenshotClient = await BrowserStack.createScreenshotClient(browserStackCredentials);
  const screenshotsJob = await generateScreenshotsAsync(screenshotClient, screenshotConfig);

  const finishedJob = await waitForJobToFinishAsync(screenshotClient, screenshotsJob.job_id);

  console.log("finishedJob: ", finishedJob);
  core.setOutput("job-result", finishedJob);
}
const ACTION_HANDLERS = {
  'generate-screenshots': generateScreenshots
};

(async () => {
  try {
    console.log('Current dir: ', path.dirname(__filename));
    console.log('Action', action)
    const actionHandler = ACTION_HANDLERS[action];

    if (!actionHandler) {
      throw new Error(`ActionHandler not found: ${action}`);
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
