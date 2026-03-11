const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('TEST_MONGODB_URI or MONGODB_URI environment variable is required for tests');
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, disconnectDB };
