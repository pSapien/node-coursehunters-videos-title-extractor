const cheerio = require('cheerio');
const axios = require('axios');

function parser(title) {
  return title
    .replace('&amp', '&')
    .replace('/', ' or ')
}

async function scrape(url) {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);
  return $('div .lessons-name')
    .contents()
    .toArray()
    .map((node, idx) => `${idx + 1}. ${parser(node.nodeValue)}`)
}

module.exports = scrape;
