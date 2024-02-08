const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 3,
    required: true,
  },
  lastName: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator(v) {
        return /\d{2,3}-\d{7,8}/.test(v);
      },
      message: '{VALUE} is not a valid phone number!',
    },
    minlength: 8,
    required: true,
  },
});

personSchema.set('toJSON', {
  transform(document, returnedObject) { // Change _id to id and delete _v from returned object
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model('Person', personSchema);

module.exports = Person;
