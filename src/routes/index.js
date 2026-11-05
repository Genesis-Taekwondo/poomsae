const path = require('path');
const config = require('../config');

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
    res.sendFile(path.join(__dirname, '..', config.server.static_dir, 'index.html'));
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

    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Form Selection</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body class="min-h-screen bg-slate-950 text-slate-100" style="font-family: 'Noto Sans', sans-serif;">
    <main class="flex min-h-screen items-center justify-center px-6 py-10">
      <section class="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <h1 class="text-3xl font-semibold">Form Selection Menu</h1>
        <p class="mt-4 text-lg text-slate-300">Choose a form from the available options.</p>
        <div class="mt-6 max-h-[60vh] overflow-y-auto pr-2">
          <ul class="space-y-4">
            ${sectionsHtml}
          </ul>
        </div>
        <div class="mt-8 flex justify-center">
          <a href="/" class="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-semibold text-slate-100 transition hover:bg-slate-700">
            Go Back
          </a>
        </div>
      </section>
    </main>
  </body>
</html>`);
  });
};
