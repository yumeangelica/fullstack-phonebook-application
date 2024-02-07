const { ALLOWED_ORIGINS } = require('../utils/config');

// Cors middleware, that allows cross origin resource sharing
const corsHeaders = (_request, response, next) => {
  response.header('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept');
  response.header('Content-Type', 'application/json');
  response.header('Content-type', 'text/html');
  response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
};

module.exports = corsHeaders;
