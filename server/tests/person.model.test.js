const mongoose = require('mongoose');
const Person = require('../models/personModel');

describe('Person model', () => {
  beforeEach(async () => {
    await Person.deleteMany({});
  });
  describe('Validation', () => {
    test('creates a valid person', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Doe',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);
      const savedPerson = await person.save();

      expect(savedPerson.firstName).toBe('John');
      expect(savedPerson.lastName).toBe('Doe');
      expect(savedPerson.number).toBe('+358 40-1234567');
      expect(savedPerson.id).toBeDefined();
    });

    test('trims whitespace from fields', async () => {
      const personData = {
        firstName: '  Jane  ',
        lastName: '  Smith  ',
        number: '  +358 44-9876543  '
      };

      const person = new Person(personData);
      const savedPerson = await person.save();

      expect(savedPerson.firstName).toBe('Jane');
      expect(savedPerson.lastName).toBe('Smith');
      expect(savedPerson.number).toBe('+358 44-9876543');
    });

    test('requires firstName', async () => {
      const personData = {
        lastName: 'Doe',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);

      await expect(person.save()).rejects.toThrow(/First name is required/);
    });

    test('requires lastName', async () => {
      const personData = {
        firstName: 'John',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);

      await expect(person.save()).rejects.toThrow(/Last name is required/);
    });

    test('requires number', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Doe'
      };

      const person = new Person(personData);

      await expect(person.save()).rejects.toThrow(/Phone number is required/);
    });

    test('validates minimum firstName length', async () => {
      const personData = {
        firstName: 'Jo',
        lastName: 'Doe',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);

      await expect(person.save()).rejects.toThrow(/First name must be at least 3 characters/);
    });

    test('validates minimum lastName length', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Do',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);

      await expect(person.save()).rejects.toThrow(/Last name must be at least 3 characters/);
    });

    test('validates minimum number length', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Doe',
        number: '+358 12'
      };

      const person = new Person(personData);

      await expect(person.save()).rejects.toThrow(/is not a valid phone number/);
    });

    test('validates maximum firstName length', async () => {
      const personData = {
        firstName: 'J'.repeat(51),
        lastName: 'Doe',
        number: '+358 40-1234567'
      };

      const person = new Person(personData);

      await expect(person.save()).rejects.toThrow(/First name cannot exceed 50 characters/);
    });

    test('validates phone number format', async () => {
      const personData = {
        firstName: 'John',
        lastName: 'Doe',
        number: 'invalid-number'
      };

      const person = new Person(personData);

      await expect(person.save()).rejects.toThrow(/is not a valid phone number/);
    });

    test('accepts various valid phone number formats', async () => {
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
          lastName: lastNames[i], // Use valid name without numbers
          number
        };

        const person = new Person(personData);
        await expect(person.save()).resolves.toBeDefined();
        await person.deleteOne(); // Clean up
      }
    });
  });

  describe('Virtual fields', () => {
    test('provides fullName virtual', async () => {
      const personData = {
        firstName: 'Alice',
        lastName: 'Smith',
        number: '+358 41-1234567'
      };

      const person = new Person(personData);
      await person.save();

      expect(person.fullName).toBe('Alice Smith');
    });
  });

  describe('JSON transformation', () => {
    test('transforms _id to id in JSON', async () => {
      const personData = {
        firstName: 'Bob',
        lastName: 'Wilson',
        number: '+358 42-1234567'
      };

      const person = new Person(personData);
      const savedPerson = await person.save();
      const jsonPerson = savedPerson.toJSON();

      expect(jsonPerson.id).toBeDefined();
      expect(jsonPerson._id).toBeUndefined();
      expect(jsonPerson.__v).toBeUndefined();
    });
  });

  describe('Indexes', () => {
    test('enforces unique firstName and lastName combination', async () => {
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
        number: '+358 50-9876543' // Different number
      };

      const person2 = new Person(duplicatePersonData);

      await expect(person2.save()).rejects.toThrow();
    });

    test('enforces unique phone number', async () => {
      const personData1 = {
        firstName: 'David',
        lastName: 'Miller',
        number: '+358 45-1234567'
      };

      const person1 = new Person(personData1);
      await person1.save();

      const personData2 = {
        firstName: 'Jane', // Different name
        lastName: 'Smith',
        number: '+358 45-1234567' // Same number
      };

      const person2 = new Person(personData2);

      await expect(person2.save()).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    test('adds createdAt and updatedAt timestamps', async () => {
      const personData = {
        firstName: 'Emma',
        lastName: 'Johnson',
        number: '+358 46-1234567'
      };

      const person = new Person(personData);
      const savedPerson = await person.save();

      expect(savedPerson.createdAt).toBeDefined();
      expect(savedPerson.updatedAt).toBeDefined();
      expect(savedPerson.createdAt).toBeInstanceOf(Date);
      expect(savedPerson.updatedAt).toBeInstanceOf(Date);
    });

    test('updates updatedAt timestamp on modification', async () => {
      const personData = {
        firstName: 'Frank',
        lastName: 'Garcia',
        number: '+358 47-1234567'
      };

      const person = new Person(personData);
      const savedPerson = await person.save();
      const originalUpdatedAt = savedPerson.updatedAt;

      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      savedPerson.firstName = 'Francisco';
      const updatedPerson = await savedPerson.save();

      expect(updatedPerson.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
