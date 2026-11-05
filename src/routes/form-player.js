const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const config = require('../config');

const formPlayerTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'views', 'form-player.html'),
  'utf8'
);
const projectRoot = path.join(__dirname, '..', '..');

const escapeHtml = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const findEnabledForm = file => {
  const formGroups = Array.isArray(config.forms) ? config.forms : [];

  for (const group of formGroups) {
    const entries = Object.values(group)[0];
    const form = (Array.isArray(entries) ? entries : [])
      .find(entry => entry && entry.enabled && entry.file === file);

    if (form) {
      return form;
    }
  }

  return null;
};

module.exports = app => {
  app.get('/form-player', (req, res) => {
    const selectedFile = req.query.form;
    const selectedForm = typeof selectedFile === 'string'
      ? findEnabledForm(selectedFile)
      : null;

    if (!selectedForm) {
      res.sendStatus(404);
      return;
    }

    res.locals.selectedFormConfig = YAML.parse(
      fs.readFileSync(path.join(projectRoot, selectedForm.file), 'utf8')
    );
    res.send(formPlayerTemplate.replace(
      '{{formName}}',
      escapeHtml(res.locals.selectedFormConfig.name)
    ));
  });
};
