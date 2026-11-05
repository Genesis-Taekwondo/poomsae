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

  it('GET /form-selection responds with 200 and contains a Go Back button', async function () {
    const res = await request(app).get('/form-selection');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Go Back'));
  });
});
