// TODO: Build a better web crawler.
const fetch = require('node-fetch');
const cheerio = require('cherio');

const crawler = async (url) => {
  try { new URL(url); } catch { return; }

  const protocol = new URL(url).protocol;

  if (protocol == 'http:' || protocol == 'https:') {
    console.log('[CRAWL] Protocol:', protocol);
  } else {
    return;
  }

  const fetchResult = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (KvantumSEbot 1.0; sebot; https://kvantumse.herokuapp.com/search?q=KvantumSEbot&type=faq)' } });
  const fetchedHMTL = await fetchResult.text();

  const $ = cheerio.load(fetchedHMTL);

  const links = $("a").map((i, link) => link.attribs.href).get();

  links.forEach(link => {
    crawler(link);
    console.log(link);
  });
}

crawler('https://theclashfruit.ga');