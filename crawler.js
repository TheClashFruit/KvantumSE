// TODO: Build a better web crawler.
module.exports = {
  runCrawler: (startingUrl, pool) => {
    const fetch = require('node-fetch');
    const cheerio = require('cherio');

    const crawler = async (url) => {
      try { new URL(url); } catch { return; }

      const protocol = new URL(url).protocol;

      if (protocol == 'http:' || protocol == 'https:') {
        //console.log('[CRAWL] Protocol:', protocol);
      } else {
        return;
      }

      const fetchResult = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; KvantumSE WoWbOt!; https://theclashfruit.ga/kse/wowbot.html)' } });
      const fetchedHMTL = await fetchResult.text();

      const $ = cheerio.load(fetchedHMTL);

      let metaTags = {};

      await $('meta').map((i, meta) => { metaTags[meta.attribs.name] = meta.attribs.content; });
      await delete metaTags[undefined];

      await pool.promise().query("INSERT INTO websites_new (url, html_title, title, meta_tags) SELECT ?,?,?,? FROM DUAL WHERE NOT EXISTS (SELECT url FROM websites_new WHERE url = ?)", [url, $('title').html(), $('title').text(), JSON.stringify(metaTags), url]);

      const links = await $("a").map((i, link) => link.attribs.href).get();

      links.forEach(link => {
        console.log(link);

        if(link.startsWith('./')) {
          const url2 = new URL(url);
          console.log(url2.protocol + '//' + url2.hostname + '/' + pathname + link.replace('./', '/'));
          crawler(url2.protocol + '//' + url2.hostname + '/' + pathname + link.replace('./', '/'));
        } else if (link.startsWith('/')) {
          const url3 = new URL(url);
          console.log(url3.protocol + '//' + url3.hostname + link);
          crawler(url3.protocol + '//' + url3.hostname + link);
        } else if (link.startsWith('//')) {
          crawler('http:' + link);
        } else {
          crawler(link);
        }
      });
    }

    crawler(startingUrl);
  }
}
