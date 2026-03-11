const mongoose = require('mongoose');

const idTransform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  delete ret.passwordHash;
  return ret;
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    trim: true,
    lowercase: true,
    validate: {
      validator(v) {
        return /^[a-z0-9_-]+$/.test(v);
      },
      message: 'Username can only contain lowercase letters, numbers, hyphens, and underscores',
    },
  },
  passwordHash: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  toJSON: { transform: idTransform },
  toObject: { transform: idTransform },
});

userSchema.index({ username: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
