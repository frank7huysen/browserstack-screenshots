const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const PDFDocument = require('pdfkit');

// Utils
const findFilesByExtension = require('../files/find-files-by-extension');

// Constants
const appDir = path.dirname(require.main.filename);
const SCREEN_SHOT_DIRECTORY = `${appDir}/screenshots`;

const generatePdf = async () => {
  console.log("Generate screenshots from directory: ", SCREEN_SHOT_DIRECTORY);

  const doc = new PDFDocument;
  const outputPath = path.join(SCREEN_SHOT_DIRECTORY, 'result.pdf');

  // Pipe its output to a file
  doc.pipe(fs.createWriteStream(outputPath));

  const images = findFilesByExtension(SCREEN_SHOT_DIRECTORY, 'jpg');
  console.log("images found: ", images);

  // Add an image, constrain it to a given size, and center it vertically and horizontally
  images.forEach((image) => {
    doc.image(image, {
      fit: [250, 300],
      align: 'center',
      valign: 'center'
    });
  })

  // Finalize PDF file
  doc.end();
}

module.exports = generatePdf;
