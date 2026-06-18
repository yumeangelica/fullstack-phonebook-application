const PORT = process.env.PORT || 5001;
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI || process.env.MONGODB_URI
    : process.env.MONGODB_URI;

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const inProduction = process.env.NODE_ENV === 'production';

// JWT_SECRET must be provided explicitly in production. Outside production we
// fall back to a clearly-unsafe development value and warn, so local setup and
// tests can run without extra configuration.
const DEV_JWT_SECRET = 'dev-secret-change-in-production';
let JWT_SECRET = process.env.JWT_SECRET;

if (inProduction) {
  if (!JWT_SECRET || JWT_SECRET === DEV_JWT_SECRET) {
    throw new Error('JWT_SECRET must be set to a secure value in production');
  }
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI must be set in production');
  }
} else if (!JWT_SECRET) {
  console.warn(
    'WARNING: JWT_SECRET is not set; using an insecure development default. Set JWT_SECRET before deploying.',
  );
  JWT_SECRET = DEV_JWT_SECRET;
}

module.exports = {
  inProduction,
  MONGODB_URI,
  PORT,
  ALLOWED_ORIGINS,
  JWT_SECRET,
};
