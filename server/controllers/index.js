const indexRouter = require('express').Router()
const Person = require('../models/person')


indexRouter.get('/', (req, res) => {
  res.send('<h1>Welcome to phonebook app back-end!</h1>')
})

indexRouter.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    const today = new Date()
    res.send(`<p> Phonebook has info for ${persons.length} people <br> ${today} </p>`)
  })
})


module.exports = indexRouter