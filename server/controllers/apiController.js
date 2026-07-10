const apiRouter = require('express').Router();
const Person = require('../models/personModel');
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');
const { requireAuth } = require('../middleware/auth');

// Escape special regex characters to prevent ReDoS and injection
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Function to normalize phone numbers to consistent international format
const normalizePhoneNumber = (number) => {
  try {
    if (!number || !isValidPhoneNumber(number)) {
      return number;
    }

    const phoneNumber = parsePhoneNumber(number);
    if (phoneNumber?.isValid()) {
      return phoneNumber.formatInternational();
    }

    return number;
  } catch (_error) {
    return number;
  }
};

// Normalize Finnish mobile numbers (remove leading zero after country code)
const normalizeFinnishNumber = (number) => {
  if (number.startsWith('+358 0') && /^\+358 0[4-5]\d/.test(number)) {
    return number.replace('+358 0', '+358 ');
  }
  return number;
};

// All person routes require authentication
apiRouter.use(requireAuth);

// Get all persons (scoped to user)
apiRouter.get('/persons', async (request, response, next) => {
  try {
    const MAX_LIMIT = 100;
    const page = Math.max(parseInt(request.query.page, 10) || 1, 1);
    const requestedLimit = parseInt(request.query.limit, 10) || MAX_LIMIT;
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
    const search = request.query.search;

    const query = { user: request.user.id };

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { firstName: { $regex: safeSearch, $options: 'i' } },
        { lastName: { $regex: safeSearch, $options: 'i' } },
      ];
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
      pages: Math.ceil(total / limit),
    };

    response.json({ persons, pagination });
  } catch (error) {
    next(error);
  }
});

// Get a person by id (scoped to user)
apiRouter.get('/persons/:id', async (request, response, next) => {
  try {
    const person = await Person.findOne({
      _id: request.params.id,
      user: request.user.id,
    });
    if (person) {
      response.json(person);
    } else {
      response.status(404).json({ error: 'Person not found' });
    }
  } catch (error) {
    next(error);
  }
});

// Add a new person (scoped to user)
apiRouter.post('/persons', async (request, response, next) => {
  const { firstName, lastName, number } = request.body;

  if (
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof number !== 'string' ||
    !firstName.trim() ||
    !lastName.trim() ||
    !number.trim()
  ) {
    return response.status(400).json({
      error: 'firstName, lastName, and number are required',
    });
  }

  const person = new Person({
    firstName,
    lastName,
    number: normalizePhoneNumber(normalizeFinnishNumber(number)),
    user: request.user.id,
  });

  try {
    const savedPerson = await person.save();
    response.status(201).json(savedPerson);
  } catch (error) {
    next(error);
  }
});

// Update a person (scoped to user)
apiRouter.put('/persons/:id', async (request, response, next) => {
  const { firstName, lastName, number } = request.body;

  if (
    (firstName !== undefined && typeof firstName !== 'string') ||
    (lastName !== undefined && typeof lastName !== 'string') ||
    (number !== undefined && typeof number !== 'string')
  ) {
    return response.status(400).json({
      error: 'firstName, lastName, and number must be strings',
    });
  }

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;

  if (number) {
    updateData.number = normalizePhoneNumber(normalizeFinnishNumber(number));
  }

  // Duplicate names are rejected by the unique index (firstName, lastName,
  // user) and mapped to 409 in the error handler
  try {
    const updatedPerson = await Person.findOneAndUpdate(
      { _id: request.params.id, user: request.user.id },
      updateData,
      { returnDocument: 'after', runValidators: true, context: 'query' },
    );
    if (updatedPerson) {
      response.json(updatedPerson);
    } else {
      response.status(404).json({ error: 'Person not found' });
    }
  } catch (error) {
    next(error);
  }
});

// Delete a person (scoped to user)
apiRouter.delete('/persons/:id', async (request, response, next) => {
  try {
    const deletedPerson = await Person.findOneAndDelete({
      _id: request.params.id,
      user: request.user.id,
    });
    if (deletedPerson) {
      response.status(204).end();
    } else {
      response.status(404).json({ error: 'Person not found' });
    }
  } catch (error) {
    next(error);
  }
});

// Get statistics (scoped to user)
apiRouter.get('/stats', async (request, response, next) => {
  try {
    const totalPersons = await Person.countDocuments({ user: request.user.id });
    const recentPersons = await Person.find({ user: request.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    response.json({
      totalPersons,
      recentPersons,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = apiRouter;
