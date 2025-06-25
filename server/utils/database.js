const mongoose = require('mongoose');

// Enhanced MongoDB connection with retry logic and production-ready configuration
const connectToMongoDB = async (uri, options = {}) => {
  const defaultOptions = {
    maxPoolSize: 10, // Maximum number of connections in the pool
    serverSelectionTimeoutMS: 5000, // How long to try connecting to server
    socketTimeoutMS: 45000, // How long to wait for socket to close
    family: 4, // Use IPv4, skip trying IPv6 for better compatibility
    ...options
  };

  const maxRetries = 5;
  let retries = 0;

  // Retry connection logic for handling transient network issues
  while (retries < maxRetries) {
    try {
      console.log(`Attempting to connect to MongoDB... (attempt ${retries + 1}/${maxRetries})`);

      await mongoose.connect(uri, defaultOptions);

      console.log('✅ Successfully connected to MongoDB');

      // Set up connection event listeners for monitoring
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

      // Handle application termination
      process.on('SIGINT', async () => {
        console.log('\n⏹️ Received SIGINT. Gracefully shutting down...');
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      });

      return mongoose.connection;
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection failed (attempt ${retries}/${maxRetries}):`, error.message);

      if (retries === maxRetries) {
        console.error('💀 Max retries reached. Could not connect to MongoDB');
        throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts: ${error.message}`);
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retries), 30000);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Connection health check
const checkConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Get connection status
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    state: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState
  };
};

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};

module.exports = {
  connectToMongoDB,
  checkConnection,
  getConnectionStatus,
  gracefulShutdown
};
