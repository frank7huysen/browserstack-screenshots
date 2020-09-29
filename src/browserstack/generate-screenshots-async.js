const generateScreenshotsAsync = (screenshotClient, screenshotSettings) => {
  return new Promise((resolve, reject) => {

    screenshotClient.generateScreenshots(screenshotSettings, (error, job) => {
      if (error) {
        return reject(error)
      }
      return resolve(job);
    });
  });
}

module.exports = generateScreenshotsAsync;
