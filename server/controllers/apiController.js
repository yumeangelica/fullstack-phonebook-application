// eslint-disable-next-line new-cap
const apiRouter = require('express').Router();
const Person = require('../models/personModel');

// Get all persons
apiRouter.get('/persons', async (request, response) => {
  try {
    const persons = await Person.find({});
    response.json(persons);
  } catch (error) {
    console.log('error', error);
    response.status(500).json({ error: 'internal server error' });
  }
});

// Get a person by id
apiRouter.get('/persons/:id', async (request, response, next) => {
  try {
    const person = await Person.findById(request.params.id);
    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

// Add a new person
apiRouter.post('/persons', async (request, response, next) => {
  const { firstName, lastName, number } = request.body;

  if (!firstName || !lastName || !number) {
    return response.status(400).json({
      error: 'firstName, lastName, or number missing',
    });
  }

  const person = new Person({
    firstName,
    lastName,
    number,
  });

  try {
    const savedPerson = await person.save();
    response.json(savedPerson);
  } catch (error) {
    next(error);
  }
});

// Update a person's number
apiRouter.put('/persons/:id', async (request, response, next) => {
  const { firstName, lastName, number } = request.body;

  // Initialize the update object
  const updateData = {};

  if (firstName) {
    updateData.firstName = firstName;
  }

  if (lastName) {
    updateData.lastName = lastName;
  }

  if (number) {
    updateData.number = number;
  }

  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      request.params.id,
      updateData,
      { new: true, runValidators: true, context: 'query' },
    );
    if (updatedPerson) {
      response.json(updatedPerson);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

// Delete a person
apiRouter.delete('/persons/:id', async (request, response, next) => {
  try {
    const deletedPerson = await Person.findByIdAndDelete(request.params.id);
    if (deletedPerson) {
      response.status(204).end();
    } else {
      response.status(404).send({ error: 'person not found' });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = apiRouter;
