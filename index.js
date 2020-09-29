const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const BrowserStack = require("browserstack");


const generateScreenshotsAsync = (screenshotClient) => {
  return new Promise((resolve, reject) => {

      screenshotClient.generateScreenshots({
          "url": "https://staging.try.theaterthuis.nl/nl-nl/",
          "win_res": "1024x768",
          "mac_res": "1920x1080",
          "quality": "compressed",
          "wait_time": 15,
          "orientation": "portrait",
          "browsers": [
              {
                  "os": "Windows",
                  "os_version": "10",
                  "browser": "chrome",
                  "browser_version": "71.0"
              },
              {
                  "os": "ios",
                  "os_version": "14",
                  "browser": "Mobile Safari",
                  "device": "iPhone 11",
                  "browser_version": null,
                  "real_mobile": true
              },
              {
                  "os": "ios",
                  "os_version": "13",
                  "browser": "Mobile Safari",
                  "device": "iPhone SE 2020",
                  "browser_version": null,
                  "real_mobile": true
              },
              {
                  "os": "android",
                  "os_version": "10.0",
                  "browser": "Android Browser",
                  "device": "Samsung Galaxy S20",
                  "browser_version": null,
                  "real_mobile": true
              },
          ]
      }, (error, job) => {
          if (error) {
              return reject(error)
          }
          return resolve(job);
      });
  });
};

(async () => {

  try {
    console.log('Start making screenshots');
    console.log('Browserstack user: ', process.env.BROWSERSTACK_USERNAME);
    console.log('Current dir: ', path.dirname(__filename));
  
    // Setup browserstack screenshot client
    const browserStackCredentials = {
      username: process.env.BROWSERSTACK_USERNAME,
      password: process.env.BROWSERSTACK_PASSWORD,
    };  

    const screenshotClient = await BrowserStack.createScreenshotClient(browserStackCredentials);
    const screenshots = await generateScreenshotsAsync(screenshotClient);
    console.log("screenshots: ", screenshots);


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
