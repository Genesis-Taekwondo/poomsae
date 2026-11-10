const request = require('supertest');
const assert = require('assert');
const app = require('../src/app');
const config = require('../src/config');

describe('App', function () {
  it('exposes the configured server port', function () {
    assert.strictEqual(app.server_port, config.server.port);
  });

  it('GET /health responds with 200', async function () {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
  });

  it('GET / responds with 200 and contains Poomsae', async function () {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Poomsae'));
  });

  it('GET / includes a Select Form link to the form selection screen', async function () {
    const res = await request(app).get('/');
    assert.ok(res.text.includes('Select Form'));
    assert.ok(res.text.includes('/form-selection'));
  });

  it('GET /styles.css serves a static asset', async function () {
    const res = await request(app).get('/styles.css');
    assert.strictEqual(res.status, 200);
  });

  it('GET /taeguk-hover.css serves Taeguk hover styles', async function () {
    const res = await request(app).get('/taeguk-hover.css');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('.taeguk-hover-pal-jang'));
    assert.ok(res.text.includes('rgb(78 52 46 / 50%)'));
  });

  it('GET /form-selection responds with 200 and contains a Back Home button', async function () {
    const res = await request(app).get('/form-selection');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Back Home'));
    assert.ok(res.text.includes('Taegeuk Il Jang'));
    assert.ok(res.text.includes('/form-player?form=data%2Fforms%2Ftaeguk%2Ftaegeuk_il_jang.yml'));
    assert.ok(res.text.includes('rounded-lg border border-slate-800 bg-slate-950'));
    assert.ok(!res.text.includes('{{formGroups}}'));
    [
      'taeguk-hover-il-jang',
      'taeguk-hover-ee-jang',
      'taeguk-hover-sam-jang',
      'taeguk-hover-sa-jang',
      'taeguk-hover-oh-jang',
      'taeguk-hover-yook-jang',
      'taeguk-hover-chil-jang',
      'taeguk-hover-pal-jang',
    ].forEach(hoverClass => assert.ok(res.text.includes(hoverClass)));
  });

  it('GET /form-player renders form metadata and movement controls', async function () {
    const res = await request(app)
      .get('/form-player')
      .query({ form: 'data/forms/taeguk/taegeuk_ee_jang.yml' });

    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('<title>Form Player</title>'));
    assert.ok(res.text.includes('data-form-name="Taegeuk Ee Jang"'));
    assert.ok(res.text.includes('Taegeuk Ee Jang'));
    assert.ok(res.text.includes('태극 2장'));
    assert.ok(res.text.includes('Joy and Lake (Tae)'));
    assert.ok(res.text.includes('aria-label="Trigram ☱">☱</span>'));
    const formTitle = res.text.match(/<a href="\/form-selection"[^>]*>([\s\S]*?)<\/a>/);
    assert.ok(formTitle);
    assert.ok(!formTitle[1].includes('☱'));
    assert.ok(res.text.includes('<nav class="flex items-center justify-between gap-3" aria-label="Player navigation">'));
    assert.ok(!res.text.includes('<path d="M4 6h16M4 12h16M4 18h16" />'));
    assert.ok(res.text.includes('aria-label="Back to form selection"'));
    assert.ok(!res.text.includes('<h1 '));
    const formDetails = res.text.slice(res.text.indexOf('aria-label="Form details"'));
    assert.ok(formDetails.indexOf('7th Geup') < formDetails.indexOf('aria-label="Trigram ☱"'));
    assert.ok(formDetails.indexOf('aria-label="Trigram ☱"') < formDetails.indexOf('Joy and Lake (Tae)'));
    assert.ok(res.text.includes('7th Geup'));
    assert.ok(res.text.includes('18 steps'));
    assert.ok(res.text.includes('data-step="18"'));
    assert.ok(res.text.includes('Execute Kihap'));
    const stepOne = res.text.match(/<button[^>]*data-step="1"[\s\S]*?<\/button>/);
    const stepEighteen = res.text.match(/<button[^>]*data-step="18"[\s\S]*?<\/button>/);
    assert.ok(stepOne);
    assert.ok(stepEighteen);
    assert.ok(!stepOne[0].includes('aria-label="Kihap"'));
    assert.ok(stepEighteen[0].includes('class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#448AFF] text-sm leading-5 text-[#448AFF]"'));
    assert.ok(stepEighteen[0].includes('&#x1F5E3;&#xFE0E;'));
    assert.ok(res.text.includes('aria-label="Home"'));
    assert.strictEqual((res.text.match(/h-11 w-11 items-center justify-center rounded-full border border-white\/25/g) || []).length, 3);
    assert.strictEqual((res.text.match(/mx-4 h-3\.5 shrink-0 border-l border-white\/25/g) || []).length, 3);
    assert.strictEqual((res.text.match(/width="24" height="24"/g) || []).length, 1);
    assert.ok(res.text.includes('class="step-list-scroll min-h-0 flex-1 overflow-y-auto px-0 py-3"'));
    assert.ok(res.text.includes('class="step-item relative w-full'));
    assert.ok(res.text.includes('<span class="mt-1 flex items-center justify-between gap-3">\n        <span class="min-w-0 flex-1 text-sm font-normal text-white/50">Left walking stance (Ap seogi)</span>'));
    assert.ok(res.text.includes('class="h-20 shrink-0 overflow-hidden border-t border-white/10 px-5 py-2" aria-label="Step notes"'));
    assert.ok(res.text.includes('<div id="notes-row" class="hidden">'));
    assert.ok(res.text.includes('class="notes-content mt-1 text-sm text-white/90"'));
    assert.ok(!res.text.includes('id="context-direction"'));
    assert.ok(!res.text.includes('id="context-stance"'));
    assert.ok(!res.text.includes('id="context-technique"'));
    assert.ok(!res.text.includes('>Poomsae</span>'));
    assert.ok(!res.text.includes('<span>Previous</span>'));
    assert.ok(!res.text.includes('<span>Next</span>'));
    assert.ok(res.text.includes('id="play-toggle"'));
    assert.ok(res.text.includes('id="step-progress"'));
    assert.ok(res.text.includes('href="/form-selection"'));
    assert.deepStrictEqual(
      Array.from(res.text.matchAll(/data-speed="([^"]+)"/g), match => match[1]),
      ['0.1', '0.3', '0.5', '0.75', '1', '1.3', '1.5', '1.75', '2']
    );
    assert.ok(!res.text.includes('{{movements}}'));
  });

  it('GET /form-player rejects a form file that is not enabled in config', async function () {
    const res = await request(app)
      .get('/form-player')
      .query({ form: '../../package.json' });

    assert.strictEqual(res.status, 404);
  });
});
