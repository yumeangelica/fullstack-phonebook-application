const authRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Person = require('../models/personModel');
const { generateToken } = require('../utils/auth');
const { requireAuth } = require('../middleware/auth');

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// Register
authRouter.post('/register', async (request, response, next) => {
  const { username, password } = request.body;

  if (!username || !password) {
    return response.status(400).json({ error: 'Username and password are required' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return response.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, passwordHash });
    const savedUser = await user.save();

    const token = await generateToken(savedUser.id, savedUser.username);

    response.status(201).json({
      token,
      username: savedUser.username,
      id: savedUser.id,
    });
  } catch (error) {
    next(error);
  }
});

// Login
authRouter.post('/login', async (request, response, next) => {
  const { username, password } = request.body;

  if (!username || !password) {
    return response.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCorrect) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    const token = await generateToken(user.id, user.username);

    response.json({
      token,
      username: user.username,
      id: user.id,
    });
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
    await Person.deleteMany({ user: request.user.id });
    const deletedUser = await User.findByIdAndDelete(request.user.id);

    if (!deletedUser) {
      return response.status(404).json({ error: 'User not found' });
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = authRouter;
