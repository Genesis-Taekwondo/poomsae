const fs = require('fs');
const path = require('path');
const config = require('../config');

const settingsTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'views', 'settings.html'),
  'utf8'
);

const getEnabledForms = () => {
  const formGroups = Array.isArray(config.forms) ? config.forms : [];

  return formGroups.flatMap(group => {
    const entries = Object.values(group)[0];
    return (Array.isArray(entries) ? entries : [])
      .filter(entry => entry && entry.enabled && entry.file);
  });
};

module.exports = app => {
  app.get('/settings', (req, res) => {
    const enabledForms = getEnabledForms();
    const selectedForm = req.query.form === undefined
      ? enabledForms[0]
      : typeof req.query.form === 'string'
        ? enabledForms.find(form => form.file === req.query.form)
        : null;

    if (!selectedForm) {
      res.sendStatus(404);
      return;
    }

    const playerUrl = `/form-player?form=${encodeURIComponent(selectedForm.file)}`;
    res.send(settingsTemplate
      .replace('{{playerUrl}}', playerUrl)
      .replace('{{playerSettings}}', JSON.stringify(config.player).replace(/</g, '\\u003c')));
  });
};
