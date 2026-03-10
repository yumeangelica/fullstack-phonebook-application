const app = require('./server/app');
const { MONGODB_URI, PORT } = require('./server/utils/config');
const { connectToMongoDB } = require('./server/utils/database');

const startServer = async () => {
  try {
    // Connect to MongoDB with retry logic
    await connectToMongoDB(MONGODB_URI);

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check available at http://localhost:${PORT}/health`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📥 Received ${signal}. Gracefully shutting down...`);
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('💀 Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
