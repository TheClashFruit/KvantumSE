module.exports = {
  endpointName: 'search',
  addEndpoint: (expressApp, pool) => {
    expressApp.get('/api/v1/search', (req, res) => {
      pool.query("SELECT * FROM websites WHERE title LIKE ?", ['%' + req.query.q + '%'], (err, rows, fields) => {
        res.json(rows);
      });
    });
  }
}