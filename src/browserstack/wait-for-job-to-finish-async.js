const getJobAsync = require('./get-job-async');

const STATUS_DONE = 'done';
const POLL_FREQUENCY_MS = 3000;

const logPendingDevices = (job) => {
  const awaitingDevices = job.screenshots
    .filter(x => x.state !== STATUS_DONE)
    .map(x => x.device);

  console.log(`\nAwaiting ${awaitingDevices.length} devices:\n${awaitingDevices}`);
}

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const waitForJobToFinish = async (screenshotClient, jobId) => {
  const job = await getJobAsync(screenshotClient, jobId);

  if (job.state !== STATUS_DONE) {
    logPendingDevices(job);
    await timeout(POLL_FREQUENCY_MS);
    return await waitForJobToFinish(screenshotClient, jobId);
  }

  return job;
}

module.exports = waitForJobToFinish;
