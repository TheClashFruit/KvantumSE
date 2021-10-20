require('dotenv').config();

const expressJs  = require('express');
const fs         = require('fs');
const mysql      = require('mysql2');
const fetch      = require('node-fetch');
const getUrls    = require('get-urls');
const expressApp = expressJs();

expressApp.set('view engine', 'ejs');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,

  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,

  database: process.env.MYSQL_DB,

  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
});

//require('./crawler').runCrawler('https://theclashfruit.ga', pool)

expressApp.get('/', (req, res) => {
  res.render('index.ejs');
});

expressApp.get('/search', (req, res) => {
  fetch('http://' + req.get('host') + '/api/v1/search?q=' + req.query.q)
    .then(response => response.json())
    .then(data => {
      res.render('search.ejs', { query: req.query.q, data: data });
    });
});

expressApp.use('/assets', expressJs.static('assets'));

const endpointFilesV1 = fs.readdirSync('./api/v1').filter(file => file.endsWith('.js'));
const endpointFilesV2 = fs.readdirSync('./api/v2').filter(file => file.endsWith('.js'));

endpointFilesV1.forEach(endpointFile => {
  require('./api/v1/' + endpointFile).addEndpoint(expressApp, pool);
});

endpointFilesV2.forEach(endpointFile => {
  require('./api/v2/' + endpointFile).addEndpoint(expressApp, pool);
});


expressApp.get('/crawl', (req, res) => {
   if(req.query.pass !== process.env.CRAWL_PASS) return;
  
  pool.query("SELECT url FROM websites", (err, rows, fields) => {
    if(err) {
      res.json({
        status: '0',
        message: err,
      });

      return;
    }

    res.json({
      status: '1',
      message: 'Started crawling all websites, this may take a while.',
      toCrawl: rows
    });

    rows.forEach(async (row) => {
      fetch(row.url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } })
        .then(response => response.text())
        .then(data => {
          const toCrawl = getUrls(data, { requireSchemeOrWww: true });
          if(toCrawl.size === 0) return;
          console.log('[CRAWL]', toCrawl);

          let i = 0;

          const crawler = async () => {
            const entries = Array.from(toCrawl);
            if (entries.size = 0) return;

            let url;

            try {
              url = new URL(entries[i]);
            } catch (e) {
              console.log('[CRAWL]', 'ERROR:', e);
              return;
            }

            if (url.protocol == 'http:' || url.protocol == 'https:') {
              console.log('[CRAWL] Protocol:', url.protocol);
            } else {
              return;
            }

            try {
              await fetch(entries[i], { headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } })
                .then(response => response.text())
                .then(data => {
                  try {
                    const title = data.match(/<title[^>]*>([^<]+)<\/title>/)[1];

                    pool.query("INSERT INTO websites (url, title) SELECT ?,? FROM DUAL WHERE NOT EXISTS (SELECT title FROM websites WHERE title = ?)", [entries[i], title, title], (err, rows, fields) => {
                      console.log('[CRAWL] Added', entries[i], '.');
                      i++;
                      crawler();
                    });
                  } catch (e) {
                    console.log('[CRAWL] ERROR:', e);
                    i++;
                    crawler();
                  }
                });
            } catch (e) {
              console.log('[CRAWL] ERROR:', e);
            }
          }

          crawler();
        });
    });
  });
});

expressApp.listen(process.env.PORT || 3000, () => {
  console.log(`[WEB] http://localhost:${process.env.PORT || 3000}`);
});

process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});