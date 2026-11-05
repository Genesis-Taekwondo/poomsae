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

  it('GET /form-player loads an enabled form and responds with the blank player view', async function () {
    const res = await request(app)
      .get('/form-player')
      .query({ form: 'data/forms/taeguk/taegeuk_chil_jang.yml' });

    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('<title>Form Player</title>'));
    assert.ok(res.text.includes('<main class="min-h-screen" data-form-name="Taegeuk Chil Jang">'));
    assert.ok(res.text.includes('href="/"'));
    assert.ok(res.text.includes('Go Home'));
    assert.ok(res.text.includes('href="/form-selection"'));
    assert.ok(res.text.includes('Back to Selection'));
  });

  it('GET /form-player rejects a form file that is not enabled in config', async function () {
    const res = await request(app)
      .get('/form-player')
      .query({ form: '../../package.json' });

    assert.strictEqual(res.status, 404);
  });
});
