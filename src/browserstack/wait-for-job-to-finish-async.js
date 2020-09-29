const getJobAsync = require('./get-job-async');

const STATUS_DONE = 'done';
const POLL_FREQUENCY_MS = 3000;

const logPendingDevices = (job) => {
  const awaitingDevices = job.screenshots
    .filter(x => x.state !== STATUS_DONE)
    .map(x => x.device);

  console.log(`\nAwaiting ${awaitingDevices.length} devices:\n${awaitingDevices}`);
}

const waitForJobToFinish = async (screenshotClient, jobId) => {
  const job = await getJobAsync(screenshotClient, jobId);

  if (job.state !== STATUS_DONE) {
    logPendingDevices(job);
    return await setTimeout(async () => await waitForJobToFinish(screenshotClient, jobId), POLL_FREQUENCY_MS);
  }

  console.log({ job: JSON.stringify(job, null, 4) });
  return job;
}

module.exports = waitForJobToFinish;
