const mongoose = require('mongoose');
require('dotenv').config();

let originalNodeEnv;

beforeAll(async () => {
  // Save original NODE_ENV and set to test
  originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';

  // Connect to MongoDB using the same URI from .env
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
  }
});

// Let individual tests handle their own cleanup

afterAll(async () => {
  // Restore original NODE_ENV
  process.env.NODE_ENV = originalNodeEnv;

  // Close database connection
  await mongoose.connection.close();
});
