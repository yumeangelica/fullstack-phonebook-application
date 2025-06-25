const Person = require('../models/personModel');

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

const nonExistingId = async () => {
  const person = new Person({
    firstName: 'Temp',
    lastName: 'Person',
    number: '+358 99 9999999'
  });
  await person.save();
  await person.deleteOne();

  return person._id.toString();
};

const personsInDb = async () => {
  const persons = await Person.find({});
  return persons.map(person => person.toJSON());
};

module.exports = {
  initialPersons,
  nonExistingId,
  personsInDb
};
