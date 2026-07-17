const path = require('path');
const config = require('../config');

module.exports = app => {
  app.get('/health', (req, res) => {
    res.sendStatus(200);
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', config.server.static_dir, 'index.html'));
  });
};
