const path = require('path');
const urlUtil = require('url');
const core = require('@actions/core');

const xml2js = require('xml2js');
const fetch = require('node-fetch');

const xmlParser = new xml2js.Parser();

// Utils
const findFilesByExtension = require('../files/find-files-by-extension');

const parseXmlAsync = (data) => {
  return new Promise((resolve, reject) => {
    xmlParser.parseString(data, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  })
}

const collectSiteMapUrls = async () => {
  const oldDomain = process.env.OLD_DOMAIN;
  const newDomain = process.env.NEW_DOMAIN;
  const sitemapUrl = process.env.WEBSITE_SITEMAP_URL;

  console.log("sitemap url: ", sitemapUrl);

  const res = await fetch(sitemapUrl);
  const xmlPlain = await res.text();
  const xmlParsed = await parseXmlAsync(xmlPlain);

  console.log(xmlParsed.urlset.url);
  if (!xmlParsed.urlset.url) return false;

  const urls = xmlParsed.urlset.url.map(({ loc }) => {
    const [url] = loc;
    const newUrl = oldDomain && newDomain
      ? url.replace(oldDomain, newDomain)
      : url;

    return newUrl;
  }) || [];

  console.log('html files found: ', urls);
  core.setOutput('urls', urls.join(','));
}

module.exports = collectSiteMapUrls;
