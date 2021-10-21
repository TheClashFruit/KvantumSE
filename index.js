require('dotenv').config();

const expressJs  = require('express');
const fs         = require('fs');
const mysql      = require('mysql2');
const fetch      = require('node-fetch');
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
  fetch('http://' + req.get('host') + '/api/v2/search?q=' + req.query.q)
    .then(response => response.json())
    .then(data => {
      if (data.status = 0) return;
      res.render('search.ejs', { query: req.query.q, data: data.message });
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

expressApp.listen(process.env.PORT || 3000, () => {
  console.log(`[WEB] http://localhost:${process.env.PORT || 3000}`);
});

process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});