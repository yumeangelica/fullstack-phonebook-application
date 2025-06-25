const express = require('express');
const { unknownEndpoint, errorHandler, requestLogger } = require('./middleware/index');
const morgan = require('morgan');
const indexRouter = require('./controllers/indexController');
const apiRouter = require('./controllers/apiController');
const { inProduction } = require('./utils/config');
const path = require('path');
const corsHeaders = require('./middleware/corsHeaders');
const app = express();

app.use(express.json());

if (inProduction) {
  console.log('in production');
  app.use(express.static(path.join(__dirname, '../build')));
}

app.use(corsHeaders);
app.use(requestLogger);

// eslint-disable-next-line no-unused-vars
morgan.token('post-data', (request, response) => { // Morgan middleware for logging post requests
  const { name, number } = request.body;
  return JSON.stringify({ name, number });
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'));

app.use('/api', apiRouter);

app.use('/', indexRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
