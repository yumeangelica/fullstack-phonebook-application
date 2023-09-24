const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /\d{2,3}-\d{7,8}/.test(v)
      },
      message: '{VALUE} is not a valid phone number!'
    },
    minlength: 8,
    required: true
  }
})

personSchema.set('toJSON', { // change _id to id and delete _v from returned object
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema) // create model from schema

module.exports = Person