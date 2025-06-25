const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app'); // This loads server/app.js
const Person = require('../models/personModel');
const helper = require('./test-helper');

const api = supertest(app);

describe('Persons API', () => {
  beforeEach(async () => {
    await Person.deleteMany({});

    // Insert initial data
    const personObjects = helper.initialPersons.map(person => new Person(person));
    const promiseArray = personObjects.map(person => person.save());
    await Promise.all(promiseArray);
  });

  describe('GET /api/persons', () => {
    test('returns persons as JSON', async () => {
      await api
        .get('/api/persons')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });

    test('returns correct number of persons', async () => {
      const response = await api.get('/api/persons');
      expect(response.body.persons).toHaveLength(helper.initialPersons.length);
    });

    test('returns persons with pagination info', async () => {
      const response = await api.get('/api/persons');

      expect(response.body).toHaveProperty('persons');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('pages');
    });

    test('supports search functionality', async () => {
      const response = await api
        .get('/api/persons?search=John')
        .expect(200);

      expect(response.body.persons).toHaveLength(2); // Should find both "John Doe" and "Bob Johnson"
      const names = response.body.persons.map(p => p.firstName);
      expect(names).toContain('John');
    });

    test('supports pagination', async () => {
      const response = await api
        .get('/api/persons?page=1&limit=2')
        .expect(200);

      expect(response.body.persons.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/persons/:id', () => {
    test('returns a specific person', async () => {
      const personsAtStart = await helper.personsInDb();
      const personToView = personsAtStart[0];

      const resultPerson = await api
        .get(`/api/persons/${personToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // Convert dates to strings for comparison since API returns string dates
      const expectedPerson = {
        ...personToView,
        createdAt: personToView.createdAt.toISOString(),
        updatedAt: personToView.updatedAt.toISOString()
      };

      expect(resultPerson.body).toEqual(expectedPerson);
    });

    test('returns 404 if person does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api
        .get(`/api/persons/${validNonexistingId}`)
        .expect(404);
    });

    test('returns 400 for invalid id', async () => {
      const invalidId = '5a3d5da59070081a82a3445';

      await api
        .get(`/api/persons/${invalidId}`)
        .expect(400);
    });
  });

  describe('POST /api/persons', () => {
    test('creates a new person with valid data', async () => {
      const newPerson = {
        firstName: 'Alice',
        lastName: 'Cooper',
        number: '+358 44 1111111'
      };

      await api
        .post('/api/persons')
        .send(newPerson)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const personsAtEnd = await helper.personsInDb();
      expect(personsAtEnd).toHaveLength(helper.initialPersons.length + 1);

      const names = personsAtEnd.map(p => `${p.firstName} ${p.lastName}`);
      expect(names).toContain('Alice Cooper');
    });

    test('returns 400 if name is missing', async () => {
      const newPerson = {
        number: '+358 44 1111111'
      };

      const result = await api
        .post('/api/persons')
        .send(newPerson)
        .expect(400);

      expect(result.body.error).toContain('required');
    });

    test('returns 400 if number is missing', async () => {
      const newPerson = {
        firstName: 'Alice',
        lastName: 'Cooper'
      };

      const result = await api
        .post('/api/persons')
        .send(newPerson)
        .expect(400);

      expect(result.body.error).toContain('required');
    });

    test('returns 400 if number is too short', async () => {
      const newPerson = {
        firstName: 'Alice',
        lastName: 'Cooper',
        number: '+358 12'
      };

      const result = await api
        .post('/api/persons')
        .send(newPerson)
        .expect(400);

      expect(result.body.error).toContain('Validation failed');
    });

    test('returns 409 if person already exists', async () => {
      const existingPerson = {
        firstName: 'John',
        lastName: 'Doe',
        number: '+358 44 9999999'
      };

      const result = await api
        .post('/api/persons')
        .send(existingPerson)
        .expect(409);

      expect(result.body.error).toContain('already exists');
    });

    test('returns 409 if number already exists', async () => {
      const existingNumber = {
        firstName: 'Different',
        lastName: 'Person',
        number: '+358 40 1234567' // Same as John Doe's number
      };

      const result = await api
        .post('/api/persons')
        .send(existingNumber)
        .expect(409);

      expect(result.body.error).toContain('Phone number already exists');
    });
  });

  describe('PUT /api/persons/:id', () => {
    test('updates a person with valid data', async () => {
      const personsAtStart = await helper.personsInDb();
      const personToUpdate = personsAtStart[0];

      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
        number: '+358 44 9999999'
      };

      const result = await api
        .put(`/api/persons/${personToUpdate.id}`)
        .send(updatedData)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(result.body.firstName).toBe('Updated');
      expect(result.body.lastName).toBe('Name');
      expect(result.body.number).toBe('+358 44 9999999');
    });

    test('returns 404 if person does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId();

      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
        number: '+358 44 9999999'
      };

      await api
        .put(`/api/persons/${validNonexistingId}`)
        .send(updatedData)
        .expect(404);
    });
  });

  describe('DELETE /api/persons/:id', () => {
    test('deletes a person', async () => {
      const personsAtStart = await helper.personsInDb();
      const personToDelete = personsAtStart[0];

      await api
        .delete(`/api/persons/${personToDelete.id}`)
        .expect(204);

      const personsAtEnd = await helper.personsInDb();
      expect(personsAtEnd).toHaveLength(helper.initialPersons.length - 1);

      const names = personsAtEnd.map(p => `${p.firstName} ${p.lastName}`);
      expect(names).not.toContain(`${personToDelete.firstName} ${personToDelete.lastName}`);
    });

    test('returns 404 if person does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api
        .delete(`/api/persons/${validNonexistingId}`)
        .expect(404);
    });
  });

  describe('GET /api/stats', () => {
    test('returns statistics', async () => {
      const result = await api
        .get('/api/stats')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(result.body).toHaveProperty('totalPersons');
      expect(result.body).toHaveProperty('recentPersons');
      expect(result.body).toHaveProperty('timestamp');
      expect(result.body.totalPersons).toBe(helper.initialPersons.length);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
