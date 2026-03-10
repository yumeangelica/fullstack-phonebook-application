const express = require('express');
const cors = require('cors');
const { unknownEndpoint, errorHandler, httpLogger } = require('./middleware/index');
const indexRouter = require('./controllers/indexController');
const apiRouter = require('./controllers/apiController');
const { inProduction, ALLOWED_ORIGINS } = require('./utils/config');
const path = require('path');
const app = express();

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json());

if (inProduction) {
  console.log('in production');
  app.use(express.static(path.join(__dirname, '../build')));
}

app.use(httpLogger);

app.use('/api', apiRouter);

app.use('/', indexRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
