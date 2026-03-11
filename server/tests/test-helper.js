const Person = require('../models/personModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/auth');

const initialPersons = [
  {
    firstName: 'John',
    lastName: 'Doe',
    number: '+358 40 1234567'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    number: '+358 50 9876543'
  },
  {
    firstName: 'Bob',
    lastName: 'Johnson',
    number: '+358 44 5555555'
  }
];

const testUser = {
  username: 'testuser',
  password: 'testpassword123',
};

// Create a test user and return { user, token }
const createTestUser = async (userData = testUser) => {
  const passwordHash = await bcrypt.hash(userData.password, 10);
  const user = new User({ username: userData.username, passwordHash });
  const savedUser = await user.save();
  const token = await generateToken(savedUser.id, savedUser.username);
  return { user: savedUser, token };
};

const nonExistingId = async (userId) => {
  const person = new Person({
    firstName: 'Temp',
    lastName: 'Person',
    number: '+358 99 9999999',
    user: userId,
  });
  await person.save();
  await person.deleteOne();

  return person._id.toString();
};

const personsInDb = async () => {
  const persons = await Person.find({});
  return persons.map(person => person.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

module.exports = {
  initialPersons,
  testUser,
  createTestUser,
  nonExistingId,
  personsInDb,
  usersInDb,
};
