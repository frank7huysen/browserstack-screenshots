const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const BrowserStack = require("browserstack");

(async () => {
  
  try {
    core.info('Start making screenshots');
    core.info('Browserstack user: ', process.env.BROWSERSTACK_USERNAME);
    core.info('Current dir: ', path.dirname(__filename));
  
    // Setup browserstack screenshot client
    const browserStackCredentials = {
      username: process.env.BROWSERSTACK_USERNAME,
      password: process.env.BROWSERSTACK_PASSWORD,
    };  
    const screenshotClient = await BrowserStack.createScreenshotClient(browserStackCredentials);
    core.info('screenshotClient: ', JSON.stringify(screenshotClient, null, 4));
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }

})();
