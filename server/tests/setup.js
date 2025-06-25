const mongoose = require('mongoose');
require('dotenv').config();

let originalNodeEnv;

beforeAll(async () => {
  // Save original NODE_ENV and set to test
  originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';

  // Use TEST_MONGODB_URI if available, otherwise fall back to MONGODB_URI
  const mongoUri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('TEST_MONGODB_URI or MONGODB_URI environment variable is required for tests');
  }

  // Connect to MongoDB using the test URI
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, {
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
