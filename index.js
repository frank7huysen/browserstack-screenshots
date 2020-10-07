
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

const path = require('path');
const core = require('@actions/core');

// Action Handlers
const generateScreenshots = require('./src/action-handlers/generate-screenshots');
const downloadScreenshots = require('./src/action-handlers/download-screenshots');
const collectGatsbyUrls = require('./src/action-handlers/collect-static-gatsby-urls');
const generatePdf = require('./src/action-handlers/generate-pdf');
const collectSitemapUrls = require('./src/action-handlers/collect-sitemap-urls');


const ACTION_HANDLERS = {
  'generate-screenshots': generateScreenshots,
  'download-screenshots': downloadScreenshots,
  'collect-static-gatsby': collectGatsbyUrls,
  'generate-pdf': generatePdf,
  'collect-sitemap-urls': collectSitemapUrls
};

(async () => {
  try {
    const action = process.env.NODE_ENV === 'development'
      ? process.env.ACTION
      : core.getInput('action');

    console.log('Current dir: ', path.dirname(__filename));
    console.log('Action', action)

    const actionHandler = ACTION_HANDLERS[action];
    if (!actionHandler) {
      const possibleActions = Object.keys(ACTION_HANDLERS).join(', ');
      throw new Error(`ActionHandler not found: ${action} possible actions: [${possibleActions}] `);
    }

    await actionHandler();

  } catch (error) {
    core.setFailed(error.message);
  }
})();
