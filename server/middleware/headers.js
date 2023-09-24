const { ALLOWED_ORIGINS } = require('../utils/config')

const corsHeaders = (_req, res, next) => { // cors middleware, that allows cross origin resource sharing
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGINS)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept')
  res.header('Content-Type', 'application/json')
  res.header('Content-type','text/html')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  next()
}

module.exports = corsHeaders