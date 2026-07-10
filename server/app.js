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

// Security headers
app.use(securityHeaders);

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json());

// Rate limiting for API routes
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
