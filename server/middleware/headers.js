const { ALLOWED_ORIGINS } = require('../utils/config');

const corsHeaders = (_request, response, next) => { // Cors middleware, that allows cross origin resource sharing
  response.header('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept');
  response.header('Content-Type', 'application/json');
  response.header('Content-type', 'text/html');
  response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
};

module.exports = corsHeaders;
