const request = require('supertest');
const assert = require('assert');
const app = require('../server');

describe('GET /', function () {
  it('responds with 200 and contains Poomsae', async function () {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Poomsae'));
  });
});
