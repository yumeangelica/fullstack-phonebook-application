const errorHandler = (error, request, response, next) => {
  console.error(`Error: ${error.message}`);
  console.error(`Stack: ${error.stack}`);

  // MongoDB validation errors - extract and format user-friendly messages
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return response.status(400).json({
      error: 'Validation failed',
      details: messages
    });
  }

  // MongoDB cast errors (invalid ObjectId)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).json({
      error: 'Invalid ID format'
    });
  }

  // MongoDB duplicate key errors - handle unique constraint violations
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];

    if (field === 'number') {
      return response.status(409).json({
        error: `Phone number already exists`
      });
    }

    return response.status(409).json({
      error: `${field} '${value}' already exists`
    });
  }

  // JWT errors (if using JWT for authentication)
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'Token expired' });
  }

  // Rate limiting errors (if using a rate limiter)
  if (error.status === 429) {
    return response.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }

  // Default server error
  response.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });

  next(error);
};

// Enhanced request logging middleware for debugging and monitoring
const requestLogger = (request, response, next) => {
  const timestamp = new Date().toISOString();
  const { method, path, ip } = request;
  const userAgent = request.get('User-Agent') || 'Unknown';

  console.log(`[${timestamp}] ${method} ${path} from ${ip}`);
  console.log(`User-Agent: ${userAgent}`);

  if (method === 'POST' || method === 'PUT') {
    // Log request body for debugging, excluding sensitive data
    const safeBody = { ...request.body };
    delete safeBody.password; // Remove password if present
    console.log('Body:', JSON.stringify(safeBody, null, 2));
  }

  console.log('---');
  next();
};

// Simple in-memory rate limiting middleware for API protection
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean expired entries to prevent memory leaks
    for (const [key, timestamps] of requests.entries()) {
      requests.set(key, timestamps.filter(time => time > windowStart));
      if (requests.get(key).length === 0) {
        requests.delete(key);
      }
    }

    // Check if IP has exceeded rate limit
    const ipRequests = requests.get(ip) || [];

    if (ipRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Track this request
    ipRequests.push(now);
    requests.set(ip, ipRequests);
    next();
  };
};

// Middleware for unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).json({
    error: 'Unknown endpoint',
    message: `Cannot ${request.method} ${request.path}`
  });
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  requestLogger,
  createRateLimiter,
  securityHeaders
};
