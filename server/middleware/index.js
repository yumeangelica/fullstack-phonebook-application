// Express requires 4 params to identify error-handling middleware
const errorHandler = (error, request, response, _next) => {
  // Full messages only in development: they can contain contact PII
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error: ${error.name}: ${error.message}`);
  } else {
    console.error(`Error: ${error.name}`);
  }

  // MongoDB validation errors - extract and format user-friendly messages
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err) => err.message);
    return response.status(400).json({
      error: 'Validation failed',
      details: messages,
    });
  }

  // MongoDB cast errors (invalid ObjectId)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).json({
      error: 'Invalid ID format',
    });
  }

  // MongoDB duplicate key errors - handle unique constraint violations
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0];

    if (field === 'username') {
      return response.status(409).json({
        error: 'Username already taken',
      });
    }

    if (field === 'number') {
      return response.status(409).json({
        error: 'Phone number already exists',
      });
    }

    // First key of the compound name index (firstName, lastName, user)
    if (field === 'firstName') {
      return response.status(409).json({
        error: 'Person with this name already exists',
      });
    }

    if (!field) {
      return response.status(409).json({
        error: 'Duplicate value',
      });
    }

    return response.status(409).json({
      error: `${field} '${error.keyValue[field]}' already exists`,
    });
  }

  // Default server error
  response.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message }),
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

    // Request bodies are never logged: they contain contact PII
    console.log(
      `${method} ${url} ${statusCode} ${contentLength} - ${duration}ms`,
    );
  });

  next();
};

// Simple in-memory rate limiting middleware for API protection.
// Counters are per-process, so limits apply per instance; a shared store
// (e.g. Redis) would be needed when scaling beyond a single instance.
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  // Periodic cleanup to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    const windowStart = now - windowMs;
    for (const [key, timestamps] of requests.entries()) {
      const filtered = timestamps.filter((time) => time > windowStart);
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

    const ipRequests = (requests.get(ip) || []).filter(
      (time) => time > windowStart,
    );

    if (ipRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000),
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
    message: `Cannot ${request.method} ${request.path}`,
  });
};

// Security headers middleware
const securityHeaders = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  );
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // Inline styles are needed for the bundled CSS and runtime style attributes
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  );
  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  httpLogger,
  createRateLimiter,
  securityHeaders,
};
