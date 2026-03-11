const { verifyToken } = require('../utils/auth');

const requireAuth = async (request, response, next) => {
  const authorization = request.get('authorization');

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return response.status(401).json({ error: 'Token missing' });
  }

  const token = authorization.substring(7);

  try {
    const payload = await verifyToken(token);
    request.user = { id: payload.id, username: payload.username };
    next();
  } catch (_error) {
    return response.status(401).json({ error: 'Token invalid or expired' });
  }
};

module.exports = { requireAuth };
