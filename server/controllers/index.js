const indexRouter = require('express').Router()
const Person = require('../models/person') // require person model

// event handler for / route
indexRouter.get('/', (req, res) => {
  res.send('<h1>Phonenumber backend test!</h1>')
})

// event handler for /info route
indexRouter.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    const today = new Date()
    res.send(`<p> Phonebook has info for ${persons.length} people <br> ${today} </p>`)
  })
})


module.exports = indexRouter