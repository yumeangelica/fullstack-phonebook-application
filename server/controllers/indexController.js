const indexRouter = require('express').Router();
const Person = require('../models/personModel');

indexRouter.get('/', (request, response) => {
  response.send('<h1>Welcome to phonebook app back-end!</h1>');
});

indexRouter.get('/info', async (request, response, next) => {
  try {
    const count = await Person.countDocuments({});
    const today = new Date();
    response.send(`<p> Phonebook has info for ${count} people <br> ${today} </p>`);
  } catch (error) {
    next(error);
  }
});

module.exports = indexRouter;
