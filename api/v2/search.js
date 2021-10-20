module.exports = {
  endpointName: 'search',
  addEndpoint: (expressApp, pool) => {
    expressApp.get('/api/v2/search', (req, res) => {
      pool.query("SELECT * FROM websites_new WHERE title LIKE ?", ['%' + req.query.q + '%'], async (err, rows, fields) => {
        let finalResaults = [];

        await rows.forEach(row => {
          finalResaults.push({
            id: row.id,
            url: row.url,
            html_title: row.html_title,
            title: row.title,
            meta_tags: JSON.parse(row.meta_tags),
            date_added: row.date_added
          })
        });

        res.json(finalResaults);
      });
    });
  }
}