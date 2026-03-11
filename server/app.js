const express = require('express');
const cors = require('cors');
const { unknownEndpoint, errorHandler, httpLogger, createRateLimiter, securityHeaders } = require('./middleware/index');
const indexRouter = require('./controllers/indexController');
const apiRouter = require('./controllers/apiController');
const healthRouter = require('./controllers/healthController');
const { inProduction, ALLOWED_ORIGINS } = require('./utils/config');
const path = require('path');
const app = express();

// Security headers
app.use(securityHeaders);

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json());

// Rate limiting for API routes
app.use('/api', createRateLimiter());

if (inProduction) {
  console.log('in production');
  app.use(express.static(path.join(__dirname, '../build')));
}

app.use(httpLogger);

app.use('/api', apiRouter);
app.use('/', healthRouter);
app.use('/', indexRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
