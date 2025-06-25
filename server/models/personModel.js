const mongoose = require('mongoose');
const { isValidPhoneNumber } = require('libphonenumber-js');

const personSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: [3, 'First name must be at least 3 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    required: [true, 'First name is required'],
    trim: true,
    validate: {
      validator(v) {
        // Unicode regex supports international names (accents, non-Latin scripts)
        const nameRegex = /^[\p{L}\s'-]+$/u;

        // Data quality checks for consistent name formatting
        if (!nameRegex.test(v) || /\s{2,}/.test(v)) return false;

        // Prevent consecutive special characters that could cause display issues
        if (/[-']{2,}/.test(v)) return false;

        // Prevent adjacent different special characters (linguistically invalid)
        if (/-'|'-/.test(v)) return false;

        // Names should not start or end with special characters
        if (/^[-']|[-']$/.test(v)) return false;

        return true;
      },
      message: 'First name can only contain letters, spaces, hyphens, and apostrophes. Invalid character combinations not allowed.',
    },
  },
  lastName: {
    type: String,
    minlength: [3, 'Last name must be at least 3 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    required: [true, 'Last name is required'],
    trim: true,
    validate: {
      validator(v) {
        // Unicode regex for proper international name support
        const nameRegex = /^[\p{L}\s'-]+$/u;

        // Basic checks
        if (!nameRegex.test(v) || /\s{2,}/.test(v)) return false;

        // No consecutive hyphens or apostrophes
        if (/[-']{2,}/.test(v)) return false;

        // No hyphen and apostrophe adjacent
        if (/-'|'-/.test(v)) return false;

        // Cannot start or end with hyphen or apostrophe
        if (/^[-']|[-']$/.test(v)) return false;

        return true;
      },
      message: 'Last name can only contain letters, spaces, hyphens, and apostrophes. Invalid character combinations not allowed.',
    },
  },
  number: {
    type: String,
    validate: {
      validator(v) {
        // Use libphonenumber-js for real-world international phone number validation
        // This library handles country-specific rules and formatting requirements
        try {
          return isValidPhoneNumber(v);
        } catch (error) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid phone number! Please use international format (e.g., +358 40 123 4567)`,
    },
    required: [true, 'Phone number is required'],
    trim: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields for audit trails
  toJSON: {
    transform(doc, ret) {
      // Transform MongoDB _id to more conventional 'id' for frontend consumption
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Database indexing for performance optimization and data integrity
personSchema.index({ firstName: 1, lastName: 1 }, { unique: true });
personSchema.index({ number: 1 }, { unique: true });

// Virtual field for computed full name without storing redundant data
personSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Person = mongoose.model('Person', personSchema);

module.exports = Person;
