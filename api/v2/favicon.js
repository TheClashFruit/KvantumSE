const cheerio = require("cherio/lib/cheerio");
const fetch   = require("node-fetch");
const fs      = require('fs');

module.exports = {
  endpointName: 'favicon',
  addEndpoint: (expressApp, pool) => {
    expressApp.get('/api/v2/favicon', async (req, res) => {
      const baseUrl = new URL(req.query.url);

      console.log(baseUrl.protocol + '//' + baseUrl.host);

      //<link rel="icon" href="/favicon.ico"></link>

      const fetchedResults = await fetch(baseUrl.protocol + '//' + baseUrl.host);
      const fetchedText    = await fetchedResults.text();

      const $ = cheerio.load(fetchedText);

      let iconUrl = "/favicon.ico";

      await $('link').each(function (i, elem) {
        if ($(this).attr('rel') == 'icon') {
          const icon = $(this).attr('href');
          iconUrl = baseUrl.protocol + '//' + baseUrl.host + icon.replace('./', '/');
        } else {
          iconUrl = baseUrl.protocol + '//' + baseUrl.host + "/favicon.ico";
        }
      });

      console.log(iconUrl);

      try {
        res.redirect(iconUrl);
      } catch {
        res.redirect('/assets/baseline_public_white_48dp.png');
      }
    });
  }
}
