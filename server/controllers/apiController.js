// eslint-disable-next-line new-cap
const apiRouter = require('express').Router();
const Person = require('../models/personModel');
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

// Function to normalize phone numbers to consistent international format
const normalizePhoneNumber = (number) => {
  try {
    if (!number || !isValidPhoneNumber(number)) {
      return number; // Return as-is if invalid, let validation handle it
    }

    const phoneNumber = parsePhoneNumber(number);
    if (phoneNumber && phoneNumber.isValid()) {
      // Format in international format with spaces (e.g., +358 40 123 4567)
      // This ensures consistent storage format across all countries
      return phoneNumber.formatInternational();
    }

    return number; // Return as-is if parsing fails
  } catch (error) {
    return number; // Return as-is if any error occurs
  }
};

// Get all persons
apiRouter.get('/persons', async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const search = request.query.search;

    let query = {};

    // Add search functionality
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const skip = (page - 1) * limit;
    const total = await Person.countDocuments(query);
    const persons = await Person.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    response.json({ persons, pagination });
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
  let { firstName, lastName, number } = request.body;

  if (!firstName || !lastName || !number) {
    return response.status(400).json({
      error: 'firstName, lastName, and number are required',
    });
  }

  // Normalize Finnish phone numbers - remove leading zero if it's a mobile number
  // Finnish mobile numbers should not include leading zero in international format
  if (number.startsWith('+358 0') && /^\+358 0[4-5]\d/.test(number)) {
    number = number.replace('+358 0', '+358 ');
  }

  // Normalize phone number to consistent international format using libphonenumber-js
  number = normalizePhoneNumber(number);

  const person = new Person({
    firstName,
    lastName,
    number,
  });

  try {
    const savedPerson = await person.save();
    response.status(201).json(savedPerson);
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
    // Apply Finnish number normalization for consistency
    if (number.startsWith('+358 0') && /^\+358 0[4-5]\d/.test(number)) {
      number = number.replace('+358 0', '+358 ');
    }
    // Normalize phone number to consistent international format
    updateData.number = normalizePhoneNumber(number);
  }

  try {
    // Check if updating to existing name combination (excluding current person)
    if (firstName && lastName) {
      const existingPerson = await Person.findOne({
        firstName,
        lastName,
        _id: { $ne: request.params.id }
      });

      if (existingPerson) {
        return response.status(409).json({
          error: 'Person with this name already exists'
        });
      }
    }

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

// Get statistics
apiRouter.get('/stats', async (request, response) => {
  try {
    const totalPersons = await Person.countDocuments({});
    const recentPersons = await Person.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    response.json({
      totalPersons,
      recentPersons,
      timestamp: new Date()
    });
  } catch (error) {
    console.log('error', error);
    response.status(500).json({ error: 'internal server error' });
  }
});

module.exports = apiRouter;
