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

const hasKihapCue = movement => [
  movement.direction,
  movement.technique,
  movement.stance,
  movement.notes,
].some(value => /kihap|kiyap|yell|shout/i.test(value || ''));

const renderMovements = movements => movements.map((movement, index) => `
  <li>
    <button
      type="button"
      class="step-item relative w-full border-l-2 border-transparent px-4 py-4 text-left text-white/40 transition-all duration-300 ease-in-out hover:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      data-index="${index}"
      data-step="${escapeHtml(movement.step)}"
      data-direction="${escapeHtml(movement.direction)}"
      data-stance="${escapeHtml(movement.stance)}"
      data-technique="${escapeHtml(movement.technique)}"
      data-notes="${escapeHtml(movement.notes || '')}"
      aria-pressed="false"
    >
      <span class="flex items-start justify-between gap-3">
        <span class="min-w-0 flex-1 text-sm font-normal text-white/50">${escapeHtml(movement.direction)}</span>
        <span class="shrink-0 text-right text-xs font-medium uppercase tracking-wide text-white/40">Step ${escapeHtml(movement.step)}</span>
      </span>
      <span class="mt-1 block text-lg font-bold">${escapeHtml(movement.technique)}</span>
      <span class="mt-1 flex items-center justify-between gap-3">
        <span class="min-w-0 flex-1 text-sm font-normal text-white/50">${escapeHtml(movement.stance)}</span>
        ${hasKihapCue(movement) ? '<span class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#448AFF] text-sm leading-5 text-[#448AFF]" role="img" aria-label="Kihap">&#x1F5E3;&#xFE0E;</span>' : ''}
      </span>
    </button>
  </li>
`).join('');

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

    const form = YAML.parse(
      fs.readFileSync(path.join(projectRoot, selectedForm.file), 'utf8')
    );
    res.locals.selectedFormConfig = form;

    const substitutions = {
      formName: escapeHtml(form.name),
      formKorean: escapeHtml(form.korean || ''),
      formMeaning: escapeHtml(form.meaning || ''),
      formTrigramLabel: form.trigram
        ? `<span class="py-0.5 text-lg text-white/80" aria-label="Trigram ${escapeHtml(form.trigram)}">${escapeHtml(form.trigram)}</span>
          <span class="mx-4 h-3.5 shrink-0 border-l border-white/25" aria-hidden="true"></span>`
        : '',
      formRank: escapeHtml(form.rank || ''),
      movementCount: escapeHtml(form.movement_count || form.movements.length),
      techniquesIntroduced: escapeHtml((form.techniques_introduced || []).join(', ')),
      movements: renderMovements(form.movements || []),
    };

    res.send(formPlayerTemplate.replace(/{{(\w+)}}/g, (placeholder, key) =>
      substitutions[key] || ''
    ));
  });
};
