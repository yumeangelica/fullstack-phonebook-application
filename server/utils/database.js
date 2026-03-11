const mongoose = require('mongoose');

// Track whether event listeners have been registered
let listenersRegistered = false;

// Enhanced MongoDB connection with retry logic and production-ready configuration
const connectToMongoDB = async (uri, options = {}) => {
  if (!uri) {
    throw new Error('MongoDB URI is required. Set MONGODB_URI environment variable.');
  }

  const defaultOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    ...options
  };

  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`Attempting to connect to MongoDB... (attempt ${retries + 1}/${maxRetries})`);

      await mongoose.connect(uri, defaultOptions);

      console.log('✅ Successfully connected to MongoDB');

      // Register event listeners only once to prevent stacking on retries
      if (!listenersRegistered) {
        mongoose.connection.on('error', (error) => {
          console.error('❌ MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
          console.log('🔄 MongoDB reconnected');
        });

        listenersRegistered = true;
      }

      return mongoose.connection;
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection failed (attempt ${retries}/${maxRetries}):`, error.message);

      if (retries === maxRetries) {
        throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts: ${error.message}`);
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retries), 30000);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Graceful shutdown — close MongoDB connection
const disconnectFromMongoDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB
};
