module.exports = {
  endpointName: 'status',
  addEndpoint: (expressApp, pool) => {
    expressApp.get('/api/v2/search', (req, res) => {
      res.json({
        message: 'api v2 soon'
      });
    });
  }
}