const app = require('./src/app');

if (require.main === module) {
  const port = process.env.PORT || app.server_port;
  app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
  });
}

module.exports = app;
