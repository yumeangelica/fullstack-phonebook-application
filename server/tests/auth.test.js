const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const { connectDB, disconnectDB } = require('./setup');
const app = require('../app');
const User = require('../models/userModel');
const Person = require('../models/personModel');
const helper = require('./test-helper');

const api = supertest(app);

describe('Auth API', () => {
  before(async () => { await connectDB(); });
  after(async () => { await disconnectDB(); });

  beforeEach(async () => {
    await Person.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('creates a new user with valid data', async () => {
      const result = await api
        .post('/api/auth/register')
        .send({ username: 'newuser', password: 'password123' })
        .expect(201)
        .expect('Content-Type', /application\/json/);

      assert.ok(result.body.token);
      assert.strictEqual(result.body.username, 'newuser');
      assert.ok(result.body.id);

      const users = await helper.usersInDb();
      assert.strictEqual(users.length, 1);
      assert.strictEqual(users[0].username, 'newuser');
    });

    it('returns 400 if username is missing', async () => {
      const result = await api
        .post('/api/auth/register')
        .send({ password: 'password123' })
        .expect(400);

      assert.ok(result.body.error.includes('required'));
    });

    it('returns 400 if password is missing', async () => {
      const result = await api
        .post('/api/auth/register')
        .send({ username: 'newuser' })
        .expect(400);

      assert.ok(result.body.error.includes('required'));
    });

    it('returns 400 if password is too short', async () => {
      const result = await api
        .post('/api/auth/register')
        .send({ username: 'newuser', password: 'short' })
        .expect(400);

      assert.ok(result.body.error.includes('8 characters'));
    });

    it('returns 400 if username is too short', async () => {
      const result = await api
        .post('/api/auth/register')
        .send({ username: 'ab', password: 'password123' })
        .expect(400);

      assert.ok(result.body.error || result.body.details);
    });

    it('returns 409 if username already exists', async () => {
      await helper.createTestUser();

      const result = await api
        .post('/api/auth/register')
        .send({ username: helper.testUser.username, password: 'anotherpassword123' })
        .expect(409);

      assert.ok(result.body.error.includes('Username already taken'));
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns token with valid credentials', async () => {
      await helper.createTestUser();

      const result = await api
        .post('/api/auth/login')
        .send({ username: helper.testUser.username, password: helper.testUser.password })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.ok(result.body.token);
      assert.strictEqual(result.body.username, helper.testUser.username);
    });

    it('returns 401 with wrong password', async () => {
      await helper.createTestUser();

      const result = await api
        .post('/api/auth/login')
        .send({ username: helper.testUser.username, password: 'wrongpassword' })
        .expect(401);

      assert.ok(result.body.error.includes('Invalid'));
    });

    it('returns 401 with nonexistent username', async () => {
      const result = await api
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'anypassword' })
        .expect(401);

      assert.ok(result.body.error.includes('Invalid'));
    });

    it('returns 400 if fields are missing', async () => {
      await api
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user with valid token', async () => {
      const { token } = await helper.createTestUser();

      const result = await api
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(result.body.username, helper.testUser.username);
      assert.ok(result.body.id);
      // Should not include passwordHash
      assert.strictEqual(result.body.passwordHash, undefined);
    });

    it('returns 401 without token', async () => {
      await api
        .get('/api/auth/me')
        .expect(401);
    });

    it('returns 401 with invalid token', async () => {
      await api
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });

  describe('DELETE /api/auth/me', () => {
    it('deletes user and all their persons', async () => {
      const { user, token } = await helper.createTestUser();

      // Add some persons for this user
      await new Person({ firstName: 'Test', lastName: 'Person', number: '+358 40 1111111', user: user.id }).save();
      await new Person({ firstName: 'Another', lastName: 'Person', number: '+358 40 2222222', user: user.id }).save();

      await api
        .delete('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const users = await helper.usersInDb();
      assert.strictEqual(users.length, 0);

      const persons = await helper.personsInDb();
      assert.strictEqual(persons.length, 0);
    });

    it('returns 401 without token', async () => {
      await api
        .delete('/api/auth/me')
        .expect(401);
    });
  });
});
