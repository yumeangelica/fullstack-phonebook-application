const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const { connectDB, disconnectDB } = require('./setup');
const app = require('../app');

const api = supertest(app);

describe('Health endpoints', () => {
  before(async () => {
    await connectDB();
  });
  after(async () => {
    await disconnectDB();
  });

  describe('GET /health', () => {
    it('returns healthy status with database info', async () => {
      const result = await api
        .get('/health')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(result.body.status, 'healthy');
      assert.strictEqual(result.body.database.status, 'connected');
      assert.strictEqual(result.body.database.operational, true);
      assert.ok(result.body.timestamp);
      assert.ok(result.body.version);
      assert.ok('uptime' in result.body);
    });
  });

  describe('GET /ready', () => {
    it('returns ready status when database is accessible', async () => {
      const result = await api
        .get('/ready')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(result.body.status, 'ready');
      assert.ok(result.body.timestamp);
    });
  });

  describe('GET /live', () => {
    it('returns alive status', async () => {
      const result = await api
        .get('/live')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(result.body.status, 'alive');
      assert.ok(result.body.timestamp);
      assert.ok('uptime' in result.body);
    });
  });
});
