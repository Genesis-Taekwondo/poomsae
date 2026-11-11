const fs = require('fs');
const path = require('path');
const config = require('../config');

const taegukHoverClasses = {
  'il-jang': 'taeguk-hover-il-jang',
  'ee-jang': 'taeguk-hover-ee-jang',
  'sam-jang': 'taeguk-hover-sam-jang',
  'sa-jang': 'taeguk-hover-sa-jang',
  'oh-jang': 'taeguk-hover-oh-jang',
  'yook-jang': 'taeguk-hover-yook-jang',
  'chil-jang': 'taeguk-hover-chil-jang',
  'pal-jang': 'taeguk-hover-pal-jang',
};

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
  app.get('/form-selection', (req, res) => {
    const visibleGroups = getVisibleFormGroups();
    const sectionsHtml = visibleGroups.map(group => `
      <li class="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <h2 class="display-font text-lg tracking-tight text-white/90">${escapeHtml(group.label)}</h2>
        <ul class="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          ${group.entries.map(entry => {
    const formSlug = entry.name
      .toLowerCase()
      .replace(/^taegeuk\s+/, '')
      .replace(/\s+/g, '-');
    const hoverClass = group.category.toLowerCase() === 'taeguk'
      ? taegukHoverClasses[formSlug] || ''
      : '';
    const hoverEffectClass = hoverClass ? 'taeguk-form-hover' : '';
    const hoverBackgroundClass = hoverClass ? '' : 'hover:bg-white/10';

    return `
            <li>
              <a href="/form-player?form=${encodeURIComponent(entry.file)}" class="block rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white/90 shadow-sm transition-colors hover:border-white/30 ${hoverEffectClass} ${hoverClass} ${hoverBackgroundClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-base">
              <span class="relative z-10">${escapeHtml(entry.name)}</span>
              </a>
            </li>
          `;
  }).join('')}
        </ul>
      </li>
    `).join('');

    res.send(formSelectionTemplate.replace('{{formGroups}}', sectionsHtml));
  });
};
