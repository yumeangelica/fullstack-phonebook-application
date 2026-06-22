const mongoose = require('mongoose');

const testMongoUri = process.env.TEST_MONGODB_URI?.trim();
const developmentMongoUri = process.env.MONGODB_URI?.trim();

if (!testMongoUri) {
  throw new Error(
    'TEST_MONGODB_URI environment variable is required for tests',
  );
}

if (developmentMongoUri && testMongoUri === developmentMongoUri) {
  throw new Error(
    'TEST_MONGODB_URI must point to a separate test database because backend tests delete data',
  );
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testMongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, disconnectDB };
