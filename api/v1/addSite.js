module.exports = {
  endpointName: 'addSite',
  addEndpoint: (expressApp, pool) => {
    expressApp.get('/api/v1/addSite', (req, res) => {
      try {
        fetch(req.query.url)
          .then(response => response.text())
          .then(data => {
            const title = data.match(/<title[^>]*>([^<]+)<\/title>/)[1];

            pool.query("INSERT INTO websites (url, title) SELECT ?,? FROM DUAL WHERE NOT EXISTS (SELECT title FROM websites WHERE title = ?)", [req.query.url, title, title], (err, rows, fields) => {
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
  }
}