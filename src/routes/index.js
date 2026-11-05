const path = require('path');

module.exports = app => {
  app.get('/health', (req, res) => {
    res.sendStatus(200);
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
  });

  require('./form-selection')(app);
};
