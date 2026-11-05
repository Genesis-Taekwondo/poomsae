const fs = require('fs');
const path = require('path');
const config = require('../config');

const formSelectionTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'views', 'form-selection.html'),
  'utf8'
);

const escapeHtml = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatCategoryName = category => category
  .split(/[_-]/)
  .filter(Boolean)
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const getVisibleFormGroups = () => {
  const formGroups = Array.isArray(config.forms) ? config.forms : [];

  return formGroups
    .map(group => {
      const [category, entries] = Object.entries(group)[0] || [];
      const enabledEntries = (Array.isArray(entries) ? entries : [])
        .filter(entry => entry && entry.enabled);

      if (!enabledEntries.length) {
        return null;
      }

      return {
        category,
        label: formatCategoryName(category),
        entries: enabledEntries,
      };
    })
    .filter(Boolean);
};

module.exports = app => {
  app.get('/health', (req, res) => {
    res.sendStatus(200);
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
  });

  app.get('/form-selection', (req, res) => {
    const visibleGroups = getVisibleFormGroups();
    const sectionsHtml = visibleGroups.map(group => `
      <li class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 class="text-lg font-semibold text-cyan-300">${escapeHtml(group.label)}</h2>
        <ul class="mt-3 space-y-2 pl-4">
          ${group.entries.map(entry => `
            <li class="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-200">
              ${escapeHtml(entry.name)}
            </li>
          `).join('')}
        </ul>
      </li>
    `).join('');

    res.send(formSelectionTemplate.replace('{{formGroups}}', sectionsHtml));
  });
};
