const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const htmlCreator = require('html-creator');

// Utils
const findFilesByExtension = require('../files/find-files-by-extension');

// Constants
const appDir = path.dirname(require.main.filename);
const SCREEN_SHOT_DIRECTORY = `${appDir}/screenshots`;

const getAllScreenshots = (screenshotJobResults) => {
  const screenshotInfo = screenshotJobResults.reduce((result, page) => {

    const screenshots = page.screenshots.map((screenshot) => {
      const urlParts = screenshot.image_url.split('/');
      const length = urlParts.length - 1;
      const fileId = urlParts[length - 1];
      const filename = urlParts[length];
      const fullName = `${fileId}-${filename}`;

      return {
        ...screenshot,
        fullName,
      };
    });

    return [...result, ...screenshots];
  }, []);

  return screenshotInfo;
};

const generateHTML = async () => {
  console.log('Generate screenshots from directory: ', SCREEN_SHOT_DIRECTORY);
  const screenshotJobResultJson =
    process.env.NODE_ENV !== 'development'
      ? core.getInput('job-result')
      : process.env.SCREENSHOTS_JOB;
  const screenshotJobResults = JSON.parse(screenshotJobResultJson);
  console.log('screenshots: ', screenshotJobResultJson);

  const outputPath = path.join(SCREEN_SHOT_DIRECTORY, 'result.html');

  const images = findFilesByExtension(SCREEN_SHOT_DIRECTORY, 'jpg');
  console.log('images found: ', images);

  // Add an image, constrain it to a given size, and center it vertically and horizontally

  const allScreenshots = getAllScreenshots(screenshotJobResults);
  console.log('allScreenshots: ', allScreenshots);


  const imageListItems = allScreenshots.map(({browser, os, os_version, url, image_url, device}) => {
    console.log({browser, os, os_version, url, image_url})
    return {
      type: 'li',
      attributes: {
        style:
          'padding: 20px; background: #e6e6e6; border-radius: 4px; margin: 4px;',
      },
      content: [
        {
          type: 'header',
          content: [
            {
              type: 'h2',
              content: browser,
              attributes: {
                style: 'margin: 0;'
              },
            },
            {
              type: 'p',
              attributes: {
                style: 'margin: 0;'
              },
              content: `${os} ${os_version}`,
            },
            {
              type: 'p',
              attributes: {
                style: 'margin: 0;'
              },
              content: device,
            },
            {
              type: 'a',
              attributes: {
                href: url
              },
              content: url,
            },
          ],
        },
        {
          type: 'img',
          attributes: {
            src: image_url,
            loading: "lazy"
          },
        },
      ],
    };

  });

  // console.log(imageListItems);

  const html = new htmlCreator([
    {
      type: 'head',
      content: [{ type: 'title', content: 'Screenshots' }],
    },
    {
      type: 'body',
      content: [
        {
          type: 'ul',
          attributes: {
            style: 'display: flex; flex-wrap: wrap; list-style: none;',
          },
          content: imageListItems,
        },
      ],
    },
  ]);

  const outputHtml = html.renderHTML();
  fs.writeFile(outputPath, outputHtml, function (err) {
    if (err) return console.log(err);
    console.log(`${outputHtml} > ${outputPath}`);
  });
};

module.exports = generateHTML;
