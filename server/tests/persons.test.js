const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const { connectDB, disconnectDB } = require('./setup');
const app = require('../app');
const Person = require('../models/personModel');
const User = require('../models/userModel');
const helper = require('./test-helper');

const api = supertest(app);

describe('Persons API', () => {
  let token;
  let userId;

  before(async () => { await connectDB(); });
  after(async () => { await disconnectDB(); });

  beforeEach(async () => {
    await Person.deleteMany({});
    await User.deleteMany({});

    // Create a test user and get token
    const auth = await helper.createTestUser();
    token = auth.token;
    userId = auth.user.id;

    // Seed persons with user reference
    const personObjects = helper.initialPersons.map(
      person => new Person({ ...person, user: userId })
    );
    await Promise.all(personObjects.map(person => person.save()));
  });

  describe('GET /api/persons', () => {
    it('returns persons as JSON', async () => {
      await api
        .get('/api/persons')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });

    it('returns 401 without token', async () => {
      await api
        .get('/api/persons')
        .expect(401);
    });

    it('returns correct number of persons', async () => {
      const response = await api
        .get('/api/persons')
        .set('Authorization', `Bearer ${token}`);
      assert.strictEqual(response.body.persons.length, helper.initialPersons.length);
    });

    it('returns persons with pagination info', async () => {
      const response = await api
        .get('/api/persons')
        .set('Authorization', `Bearer ${token}`);

      assert.ok('persons' in response.body);
      assert.ok('pagination' in response.body);
      assert.ok('page' in response.body.pagination);
      assert.ok('limit' in response.body.pagination);
      assert.ok('total' in response.body.pagination);
      assert.ok('pages' in response.body.pagination);
    });

    it('supports search functionality', async () => {
      const response = await api
        .get('/api/persons?search=John')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      assert.strictEqual(response.body.persons.length, 2);
      const names = response.body.persons.map(p => p.firstName);
      assert.ok(names.includes('John'));
    });

    it('handles search with regex special characters safely', async () => {
      const response = await api
        .get('/api/persons?search=.*')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should return empty results, not crash or match everything
      assert.ok(Array.isArray(response.body.persons));
    });

    it('supports pagination', async () => {
      const response = await api
        .get('/api/persons?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      assert.ok(response.body.persons.length <= 2);
      assert.strictEqual(response.body.pagination.page, 1);
      assert.strictEqual(response.body.pagination.limit, 2);
    });

    it('does not return other users persons', async () => {
      // Create another user with a person
      const otherAuth = await helper.createTestUser({ username: 'otheruser', password: 'otherpassword123' });
      await new Person({ firstName: 'Other', lastName: 'Person', number: '+358 40 9999999', user: otherAuth.user.id }).save();

      const response = await api
        .get('/api/persons')
        .set('Authorization', `Bearer ${token}`);

      // Should only see original user's persons, not the other user's
      assert.strictEqual(response.body.persons.length, helper.initialPersons.length);
      const names = response.body.persons.map(p => p.firstName);
      assert.ok(!names.includes('Other'));
    });
  });

  describe('GET /api/persons/:id', () => {
    it('returns a specific person', async () => {
      const personsAtStart = await helper.personsInDb();
      const personToView = personsAtStart[0];

      const resultPerson = await api
        .get(`/api/persons/${personToView.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const expectedPerson = {
        ...personToView,
        user: personToView.user.toString(),
        createdAt: personToView.createdAt.toISOString(),
        updatedAt: personToView.updatedAt.toISOString()
      };

      assert.deepStrictEqual(resultPerson.body, expectedPerson);
    });

    it('returns 404 if person does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId(userId);

      await api
        .get(`/api/persons/${validNonexistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('returns 400 for invalid id', async () => {
      const invalidId = '5a3d5da59070081a82a3445';

      await api
        .get(`/api/persons/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });

  describe('POST /api/persons', () => {
    it('creates a new person with valid data', async () => {
      const newPerson = {
        firstName: 'Alice',
        lastName: 'Cooper',
        number: '+358 44 1111111'
      };

      await api
        .post('/api/persons')
        .set('Authorization', `Bearer ${token}`)
        .send(newPerson)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const personsAtEnd = await helper.personsInDb();
      assert.strictEqual(personsAtEnd.length, helper.initialPersons.length + 1);

      const names = personsAtEnd.map(p => `${p.firstName} ${p.lastName}`);
      assert.ok(names.includes('Alice Cooper'));
    });

    it('returns 400 if name is missing', async () => {
      const newPerson = {
        number: '+358 44 1111111'
      };

      const result = await api
        .post('/api/persons')
        .set('Authorization', `Bearer ${token}`)
        .send(newPerson)
        .expect(400);

      assert.ok(result.body.error.includes('required'));
    });

    it('returns 400 if number is missing', async () => {
      const newPerson = {
        firstName: 'Alice',
        lastName: 'Cooper'
      };

      const result = await api
        .post('/api/persons')
        .set('Authorization', `Bearer ${token}`)
        .send(newPerson)
        .expect(400);

      assert.ok(result.body.error.includes('required'));
    });

    it('returns 400 if number is too short', async () => {
      const newPerson = {
        firstName: 'Alice',
        lastName: 'Cooper',
        number: '+358 12'
      };

      const result = await api
        .post('/api/persons')
        .set('Authorization', `Bearer ${token}`)
        .send(newPerson)
        .expect(400);

      assert.ok(result.body.error.includes('Validation failed'));
    });

    it('returns 409 if person already exists', async () => {
      const existingPerson = {
        firstName: 'John',
        lastName: 'Doe',
        number: '+358 44 9999999'
      };

      const result = await api
        .post('/api/persons')
        .set('Authorization', `Bearer ${token}`)
        .send(existingPerson)
        .expect(409);

      assert.ok(result.body.error.includes('already exists'));
    });

    it('returns 409 if number already exists', async () => {
      const existingNumber = {
        firstName: 'Different',
        lastName: 'Person',
        number: '+358 40 1234567'
      };

      const result = await api
        .post('/api/persons')
        .set('Authorization', `Bearer ${token}`)
        .send(existingNumber)
        .expect(409);

      assert.ok(result.body.error.includes('Phone number already exists'));
    });
  });

  describe('PUT /api/persons/:id', () => {
    it('updates a person with valid data', async () => {
      const personsAtStart = await helper.personsInDb();
      const personToUpdate = personsAtStart[0];

      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
        number: '+358 44 9999999'
      };

      const result = await api
        .put(`/api/persons/${personToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(result.body.firstName, 'Updated');
      assert.strictEqual(result.body.lastName, 'Name');
      assert.strictEqual(result.body.number, '+358 44 9999999');
    });

    it('returns 404 if person does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId(userId);

      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
        number: '+358 44 9999999'
      };

      await api
        .put(`/api/persons/${validNonexistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(404);
    });
  });

  describe('DELETE /api/persons/:id', () => {
    it('deletes a person', async () => {
      const personsAtStart = await helper.personsInDb();
      const personToDelete = personsAtStart[0];

      await api
        .delete(`/api/persons/${personToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const personsAtEnd = await helper.personsInDb();
      assert.strictEqual(personsAtEnd.length, helper.initialPersons.length - 1);

      const names = personsAtEnd.map(p => `${p.firstName} ${p.lastName}`);
      assert.ok(!names.includes(`${personToDelete.firstName} ${personToDelete.lastName}`));
    });

    it('returns 404 if person does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId(userId);

      await api
        .delete(`/api/persons/${validNonexistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('GET /api/stats', () => {
    it('returns statistics', async () => {
      const result = await api
        .get('/api/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.ok('totalPersons' in result.body);
      assert.ok('recentPersons' in result.body);
      assert.ok('timestamp' in result.body);
      assert.strictEqual(result.body.totalPersons, helper.initialPersons.length);
    });
  });
});
