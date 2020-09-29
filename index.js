const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const BrowserStack = require("browserstack");

// Utils
const generateScreenshotsAsync = require('./src/browserstack/generate-screenshots-async');
const waitForJobToFinishAsync = require('./src/browserstack/wait-for-job-to-finish-async');

const screenshotConfig = {
  "url": "https://staging.try.theaterthuis.nl/nl-nl/",
  "win_res": "1024x768",
  "mac_res": "1920x1080",
  "quality": "compressed",
  "wait_time": 15,
  "orientation": "portrait",
  "browsers": [
    // {
    //   "os": "Windows",
    //   "os_version": "10",
    //   "browser": "chrome",
    //   "browser_version": "71.0"
    // },
    {
      "os": "ios",
      "os_version": "14",
      "browser": "Mobile Safari",
      "device": "iPhone 11",
      "browser_version": null,
      "real_mobile": true
    },
    // {
    //   "os": "ios",
    //   "os_version": "13",
    //   "browser": "Mobile Safari",
    //   "device": "iPhone SE 2020",
    //   "browser_version": null,
    //   "real_mobile": true
    // },
    // {
    //   "os": "android",
    //   "os_version": "10.0",
    //   "browser": "Android Browser",
    //   "device": "Samsung Galaxy S20",
    //   "browser_version": null,
    //   "real_mobile": true
    // },
  ]
};

const generateScreenshots = async () => {
  console.log('Start making screenshots');
  console.log('Browserstack user: ', process.env.BROWSERSTACK_USERNAME);

  if(!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_PASSWORD) {
    throw new Error('Browserstack USERNAME or PASSWORD not set');
  }

  // Setup browser stack screenshot client
  const browserStackCredentials = {
    username: process.env.BROWSERSTACK_USERNAME,
    password: process.env.BROWSERSTACK_PASSWORD,
  };

  const screenshotClient = await BrowserStack.createScreenshotClient(browserStackCredentials);
  const screenshotsJob = await generateScreenshotsAsync(screenshotClient, screenshotConfig);
  const finishedJob = await waitForJobToFinishAsync(screenshotClient, screenshotsJob.job_id);

  console.log("finishedJob: ", finishedJob.screenshots);
  // core.setOutput("job_result", finishedJob);

}

const ACTION_HANDLERS = {
  'generate-screenshots': generateScreenshots
};

(async () => {

  try {
    console.log('Current dir: ', path.dirname(__filename));
    console.log('Action', core.getInput('action'))

    const action = core.getInput('action');
    const actionHandler = ACTION_HANDLERS[action];

    if(!actionHandler) {
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
