require('dotenv').config();

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? (process.env.TEST_MONGODB_URI || process.env.MONGODB_URI)
  : process.env.MONGODB_URI;

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const inProduction = process.env.NODE_ENV === 'production';

module.exports = {
  inProduction,
  MONGODB_URI,
  PORT,
  ALLOWED_ORIGINS,
};
