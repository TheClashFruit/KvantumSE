require('dotenv').config();

const expressJs  = require('express');
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

    rows.forEach(row => {
      fetch(row.url)
        .then(response => response.text())
        .then(data => {
          const toCrawl = getUrls(data, { requireSchemeOrWww: true });
          if(toCrawl.size === 0) return;
          console.log('[CRAWL]', toCrawl);

          let i = 0;

          const crawler = () => {
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

            fetch(entries[i])
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
          }

          crawler();
        });
    });
  });
})

expressApp.get('/api/v1/search', (req, res) => {
  console.log('[API]', req.url)

  pool.query("SELECT * FROM websites WHERE title LIKE ?", [ '%' + req.query.q + '%' ], (err, rows, fields) => {
    res.json(rows);
  });
});

expressApp.get('/api/v1/addSite', (req, res) => {
  console.log('[API]', req.url)

  try {
    fetch(req.query.url)
      .then(response => response.text())
      .then(data => {
        const title = data.match(/<title[^>]*>([^<]+)<\/title>/)[1];

        pool.query("INSERT INTO websites (url, title) SELECT ?,? FROM DUAL WHERE NOT EXISTS (SELECT url FROM websites WHERE url = ?)", [req.query.url, title, req.query.url], (err, rows, fields) => {
          res.json({
            status: 1,
            message: 'Added the website.'
          });
        });
      });
  } catch (e) {
    res.json({
      status: 0,
      message: e
    });
  }
});

expressApp.listen(process.env.PORT || 3000, () => {
  console.log(`[WEB] http://localhost:${process.env.PORT || 3000}`);
});
