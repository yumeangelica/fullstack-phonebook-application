const indexRouter = require('express').Router()
const Person = require('../models/person')

indexRouter.get('/', (request, response) => {
  response.send('<h1>Welcome to phonebook app back-end!</h1>')
})

indexRouter.get('/info', async (request, response) => {
  try {
    const persons = await Person.find({})
    const today = new Date()
    response.send(`<p> Phonebook has info for ${persons.length} people <br> ${today} </p>`)
  } catch (error) {
    response.status(500).json({ error: 'internal server error' })
  }
})

module.exports = indexRouter
