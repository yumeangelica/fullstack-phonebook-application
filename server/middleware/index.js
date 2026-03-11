// Express requires 4 params to identify error-handling middleware
const errorHandler = (error, request, response, _next) => {
  console.error(`Error: ${error.message}`);

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
        error: 'Phone number already exists'
      });
    }

    return response.status(409).json({
      error: `${field} '${value}' already exists`
    });
  }

  // Rate limiting errors
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
};

// HTTP request logging middleware
const httpLogger = (request, response, next) => {
  const start = Date.now();

  response.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url } = request;
    const { statusCode } = response;
    const contentLength = response.get('content-length') || 0;

    let line = `${method} ${url} ${statusCode} ${contentLength} - ${duration}ms`;

    if ((method === 'POST' || method === 'PUT') && request.body) {
      const { firstName, lastName, number } = request.body;
      line += ` ${JSON.stringify({ firstName, lastName, number })}`;
    }

    console.log(line);
  });

  next();
};

// Simple in-memory rate limiting middleware for API protection
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  // Periodic cleanup to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    const windowStart = now - windowMs;
    for (const [key, timestamps] of requests.entries()) {
      const filtered = timestamps.filter(time => time > windowStart);
      if (filtered.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, filtered);
      }
    }
  }, windowMs);

  // Don't prevent Node.js from exiting
  cleanupInterval.unref();

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    const ipRequests = (requests.get(ip) || []).filter(time => time > windowStart);

    if (ipRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

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
const securityHeaders = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  httpLogger,
  createRateLimiter,
  securityHeaders
};
