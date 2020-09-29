const getJobAsync = (screenshotClient, jobId) => {
  return new Promise((resolve, reject) => {
    screenshotClient.getJob(jobId, (error, job) => {
      if (error) {
        return reject(error);
      }
      return resolve(job);
    })
  })
}

module.exports = getJobAsync;
