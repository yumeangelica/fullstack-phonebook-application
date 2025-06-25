const apiRouter = require('express').Router();
const mongoose = require('mongoose');
const Person = require('../models/personModel');
const os = require('os');

// Health check endpoint
apiRouter.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState;
    const dbStatuses = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Check if the database is operational
    let dbOperational = false;
    try {
      await Person.findOne().limit(1);
      dbOperational = true;
    } catch (error) {
      console.error('Health check DB operation failed:', error);
    }

    const health = {
      status: dbStatus === 1 && dbOperational ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatuses[dbStatus],
        operational: dbOperational
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        system: Math.round(os.totalmem() / 1024 / 1024 / 1024)
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        loadavg: os.loadavg(),
        cpus: os.cpus().length
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Readiness check endpoint (for container orchestration)
apiRouter.get('/ready', async (req, res) => {
  try {
    // Simple check to see if the application can handle requests
    await Person.findOne().limit(1);
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Database not accessible'
    });
  }
});

// Liveness check endpoint (for container orchestration)
apiRouter.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = apiRouter;
