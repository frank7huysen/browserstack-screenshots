const core = require('@actions/core');
const fetch = require('node-fetch');

const slackPost = async () => {
  try {
    const payload = core.getInput('json-payload');
    console.log('====POST-SLACK-MESSAGE====');
    console.log('payload: ', payload);

    const body = JSON.stringify(payload);

    const response = await fetch(process.env.SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
     });

    const text = await response.text();
    console.log({ text });
    if(text !== 'ok') throw new Error(text);
  } catch (error) {
    console.log('failed to send slack message: ', error);
    core.setFailed(error.message);
  }
};

module.exports = slackPost;
