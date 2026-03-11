const { SignJWT, jwtVerify } = require('jose');
const { JWT_SECRET } = require('./config');

// Encode the secret for jose (requires Uint8Array)
const getSecret = () => new TextEncoder().encode(JWT_SECRET);

const generateToken = async (userId, username) => {
  const token = await new SignJWT({ id: userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getSecret());

  return token;
};

const verifyToken = async (token) => {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
};

module.exports = { generateToken, verifyToken };
