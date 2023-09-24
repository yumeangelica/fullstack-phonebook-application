require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI  // reading env file
const PORT = process.env.PORT
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS

const inProduction = process.env.NODE_ENV === 'production'

module.exports = {
  inProduction,
  MONGODB_URI,
  PORT,
  ALLOWED_ORIGINS
}
