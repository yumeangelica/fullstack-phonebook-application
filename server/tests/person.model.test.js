const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { connectDB, disconnectDB } = require('./setup');
const Person = require('../models/personModel');

describe('Person model', () => {
  before(async () => { await connectDB(); });
  after(async () => { await disconnectDB(); });

  beforeEach(async () => {
    await Person.deleteMany({});
  });

  describe('Validation', () => {
    it('creates a valid person', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Doe',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);
      const savedPerson = await person.save();

      assert.strictEqual(savedPerson.firstName, 'John');
      assert.strictEqual(savedPerson.lastName, 'Doe');
      assert.strictEqual(savedPerson.number, '+358 40-1234567');
      assert.ok(savedPerson.id !== undefined);
    });

    it('trims whitespace from fields', async () => {
      const personData = {
        firstName: '  Jane  ',
        lastName: '  Smith  ',
        number: '  +358 44-9876543  '
      };

      const person = new Person(personData);
      const savedPerson = await person.save();

      assert.strictEqual(savedPerson.firstName, 'Jane');
      assert.strictEqual(savedPerson.lastName, 'Smith');
      assert.strictEqual(savedPerson.number, '+358 44-9876543');
    });

    it('requires firstName', async () => {
      const personData = {
        lastName: 'Doe',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);
      await assert.rejects(() => person.save(), /First name is required/);
    });

    it('requires lastName', async () => {
      const personData = {
        firstName: 'John',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);
      await assert.rejects(() => person.save(), /Last name is required/);
    });

    it('requires number', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Doe'
      };

      const person = new Person(personData);
      await assert.rejects(() => person.save(), /Phone number is required/);
    });

    it('validates minimum firstName length', async () => {
      const personData = {
        firstName: 'Jo',
        lastName: 'Doe',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);
      await assert.rejects(() => person.save(), /First name must be at least 3 characters/);
    });

    it('validates minimum lastName length', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Do',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);
      await assert.rejects(() => person.save(), /Last name must be at least 3 characters/);
    });

    it('validates minimum number length', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Doe',
        number: '+358 12'
      };

      const person = new Person(personData);
      await assert.rejects(() => person.save(), /is not a valid phone number/);
    });

    it('validates maximum firstName length', async () => {
      const personData = {
        firstName: 'J'.repeat(51),
        lastName: 'Doe',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);
      await assert.rejects(() => person.save(), /First name cannot exceed 50 characters/);
    });

    it('validates phone number format', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Doe',
        number: 'invalid-number'
      };

      const person = new Person(personData);
      await assert.rejects(() => person.save(), /is not a valid phone number/);
    });

    it('accepts various valid phone number formats', async () => {
      const validNumbers = [
        '+358 40 1234567',
        '+358 50 1234567',
        '+1 2125551234',
        '+44 20 1234 5678',
        '+49 30 12345678'
      ];

      const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'
      ];

      for (let i = 0; i < validNumbers.length; i++) {
        const number = validNumbers[i];
        const personData = {
          firstName: 'John',
          lastName: lastNames[i],
          number
        };

        const person = new Person(personData);
        const result = await person.save();
        assert.ok(result !== undefined);
        await person.deleteOne();
      }
    });
  });

  describe('Virtual fields', () => {
    it('provides fullName virtual', async () => {
      const personData = {
        firstName: 'Alice',
        lastName: 'Smith',
        number: '+358 41-1234567'
      };

      const person = new Person(personData);
      await person.save();

      assert.strictEqual(person.fullName, 'Alice Smith');
    });
  });

  describe('JSON transformation', () => {
    it('transforms _id to id in JSON', async () => {
      const personData = {
        firstName: 'Bob',
        lastName: 'Wilson',
        number: '+358 42-1234567'
      };

      const person = new Person(personData);
      const savedPerson = await person.save();
      const jsonPerson = savedPerson.toJSON();

      assert.ok(jsonPerson.id !== undefined);
      assert.strictEqual(jsonPerson._id, undefined);
      assert.strictEqual(jsonPerson.__v, undefined);
    });
  });

  describe('Indexes', () => {
    it('enforces unique firstName and lastName combination', async () => {
      const personData = {
        firstName: 'Charlie',
        lastName: 'Brown',
        number: '+358 43-1234567'
      };

      const person1 = new Person(personData);
      await person1.save();

      const duplicatePersonData = {
        firstName: 'Charlie',
        lastName: 'Brown',
        number: '+358 50-9876543'
      };

      const person2 = new Person(duplicatePersonData);
      await assert.rejects(() => person2.save());
    });

    it('enforces unique phone number', async () => {
      const personData1 = {
        firstName: 'David',
        lastName: 'Miller',
        number: '+358 45-1234567'
      };

      const person1 = new Person(personData1);
      await person1.save();

      const personData2 = {
        firstName: 'Jane',
        lastName: 'Smith',
        number: '+358 45-1234567'
      };

      const person2 = new Person(personData2);
      await assert.rejects(() => person2.save());
    });
  });

  describe('Timestamps', () => {
    it('adds createdAt and updatedAt timestamps', async () => {
      const personData = {
        firstName: 'Emma',
        lastName: 'Johnson',
        number: '+358 46-1234567'
      };

      const person = new Person(personData);
      const savedPerson = await person.save();

      assert.ok(savedPerson.createdAt !== undefined);
      assert.ok(savedPerson.updatedAt !== undefined);
      assert.ok(savedPerson.createdAt instanceof Date);
      assert.ok(savedPerson.updatedAt instanceof Date);
    });

    it('updates updatedAt timestamp on modification', async () => {
      const personData = {
        firstName: 'Frank',
        lastName: 'Garcia',
        number: '+358 47-1234567'
      };

      const person = new Person(personData);
      const savedPerson = await person.save();
      const originalUpdatedAt = savedPerson.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      savedPerson.firstName = 'Francisco';
      const updatedPerson = await savedPerson.save();

      assert.ok(updatedPerson.updatedAt.getTime() > originalUpdatedAt.getTime());
    });
  });
});
