const validator = require('validator');
const mongoSanitize = require('express-mongo-sanitize');

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Only trim whitespace for API requests, don't escape HTML
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }

  if (req.query) {
    sanitizeObject(req.query);
  }

  next();
};

// Enhanced validation middleware for person data
const validatePersonData = (req, res, next) => {
  const { firstName, lastName, number } = req.body;
  const errors = [];

  // Check required fields
  if (!firstName) errors.push('First name is required');
  if (!lastName) errors.push('Last name is required');
  if (!number) errors.push('Phone number is required');

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  // Validate field lengths
  if (firstName.length < 3) {
    errors.push('First name must be at least 3 characters long');
  }
  if (firstName.length > 50) {
    errors.push('First name cannot exceed 50 characters');
  }

  if (lastName.length < 3) {
    errors.push('Last name must be at least 3 characters long');
  }
  if (lastName.length > 50) {
    errors.push('Last name cannot exceed 50 characters');
  }

  if (number.length < 8) {
    errors.push('Phone number must be at least 8 characters long');
  }
  if (number.length > 20) {
    errors.push('Phone number cannot exceed 20 characters');
  }

  // Validate phone number format
  const phoneRegex = /^(\+\d{1,3}\s?)?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}$/;
  if (!phoneRegex.test(number)) {
    errors.push('Phone number format is invalid. Use format: XX-XXXXXXX or XXX-XXXXXXXX');
  }

  // Validate names contain only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(firstName)) {
    errors.push('First name can only contain letters, spaces, hyphens, and apostrophes');
  }
  if (!nameRegex.test(lastName)) {
    errors.push('Last name can only contain letters, spaces, hyphens, and apostrophes');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  // Clean and prepare data
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  req.body.number = number.trim();

  next();
};

// Validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!validator.isMongoId(id)) {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  next();
};

// Validate query parameters
const validateQueryParams = (req, res, next) => {
  const { page, limit, search } = req.query;

  if (page && (!validator.isInt(page, { min: 1 }))) {
    return res.status(400).json({
      error: 'Page must be a positive integer'
    });
  }

  if (limit && (!validator.isInt(limit, { min: 1, max: 100 }))) {
    return res.status(400).json({
      error: 'Limit must be a positive integer between 1 and 100'
    });
  }

  if (search && search.length > 100) {
    return res.status(400).json({
      error: 'Search query cannot exceed 100 characters'
    });
  }

  next();
};

module.exports = {
  sanitizeInput,
  validatePersonData,
  validateObjectId,
  validateQueryParams,
  mongoSanitize: mongoSanitize()
};
