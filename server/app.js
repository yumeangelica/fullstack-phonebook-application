const express = require('express');
const cors = require('cors');
const {
  unknownEndpoint,
  errorHandler,
  httpLogger,
  createRateLimiter,
  securityHeaders,
} = require('./middleware/index');
const apiRouter = require('./controllers/apiController');
const authRouter = require('./controllers/authController');
const healthRouter = require('./controllers/healthController');
const { inProduction, ALLOWED_ORIGINS } = require('./utils/config');
const path = require('node:path');
const app = express();

// Behind a reverse proxy in production; needed so req.ip reflects the client
// instead of the proxy (rate limiting is keyed on req.ip)
if (inProduction) {
  app.set('trust proxy', 1);
}

// Security headers
app.use(securityHeaders);

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
  }),
);
app.use(express.json({ limit: '100kb' }));

// Rate limiting for API routes, with a stricter limit on credential endpoints
app.use(
  ['/api/auth/login', '/api/auth/register'],
  createRateLimiter(15 * 60 * 1000, 30),
);
app.use('/api', createRateLimiter());

if (inProduction) {
  app.use(express.static(path.join(__dirname, '../build')));
}

app.use(httpLogger);

app.use('/api/auth', authRouter);
app.use('/api', apiRouter);
app.use('/', healthRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
