require('dotenv').config();
const { MONGODB_URI } = process.env;
const { PORT } = process.env;
const { ALLOWED_ORIGINS } = process.env;

const inProduction = process.env.NODE_ENV === 'production';

module.exports = {
  inProduction,
  MONGODB_URI,
  PORT,
  ALLOWED_ORIGINS,
};
