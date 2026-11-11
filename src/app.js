const express = require('express');
const path = require('path');
const config = require('./config');

const app = express();
app.server_port = config.server.port;

require('./routes')(app);

app.use(express.static(
  path.join(__dirname, '..', config.server.static_dir),
  { index: false }
));

module.exports = app;
