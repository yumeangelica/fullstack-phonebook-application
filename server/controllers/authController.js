const authRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Person = require('../models/personModel');
const { generateToken } = require('../utils/auth');
const { requireAuth } = require('../middleware/auth');

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// Compared against when the user is not found, so login takes the same time
// whether or not the username exists (prevents timing-based enumeration)
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('timing-equalizer', SALT_ROUNDS);

const normalizeUsername = (username) => username.trim().toLowerCase();

const createAuthResponse = async (user) => {
  const id = user._id.toString();
  const token = await generateToken(id, user.username);

  return {
    token,
    username: user.username,
    id,
  };
};

// Register
authRouter.post('/register', async (request, response, next) => {
  const { username, password } = request.body;

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password
  ) {
    return response
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return response.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      username: normalizeUsername(username),
      passwordHash,
    });
    const savedUser = await user.save();

    response.status(201).json(await createAuthResponse(savedUser));
  } catch (error) {
    next(error);
  }
});

// Login
authRouter.post('/login', async (request, response, next) => {
  const { username, password } = request.body;

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password
  ) {
    return response
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username: normalizeUsername(username) });

    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      return response
        .status(401)
        .json({ error: 'Invalid username or password' });
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCorrect) {
      return response
        .status(401)
        .json({ error: 'Invalid username or password' });
    }

    response.json(await createAuthResponse(user));
  } catch (error) {
    next(error);
  }
});

// Get current user
authRouter.get('/me', requireAuth, async (request, response, next) => {
  try {
    const user = await User.findById(request.user.id);

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    response.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete account + all user's persons (cascade)
authRouter.delete('/me', requireAuth, async (request, response, next) => {
  try {
    const { deletedCount } = await Person.deleteMany({
      user: request.user.id,
    });
    const deletedUser = await User.findByIdAndDelete(request.user.id);

    if (!deletedUser) {
      return response.status(404).json({ error: 'User not found' });
    }

    // Audit log for a destructive operation (no personal data, only ids/counts)
    console.info(
      `AUDIT account deleted: userId=${request.user.id} contactsRemoved=${deletedCount}`,
    );

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = authRouter;
