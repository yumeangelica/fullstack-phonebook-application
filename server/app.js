const express = require('express')
const { unknownEndpoint, errorHandler, requestLogger } = require('./middleware/index')
const morgan = require('morgan')

const indexRouter = require('./controllers/index')
const apiRouter = require('./controllers/api')

const { inProduction } = require('./utils/config')
const path = require('path')
const corsHeaders = require('./middleware/headers')

const app = express()

app.use(express.json())

if (inProduction) {
  console.log('in production')
  app.use(express.static(path.join(__dirname, '../build')))
}

app.use(corsHeaders)


app.use(requestLogger)

morgan.token('post-data', (req, res) => { // morgan middleware for logging post requests
  const body = req.body
  let data = { name: body.name, number: body.number }
  return JSON.stringify(data)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data')) // loggin post requests



app.use('', indexRouter)
app.use('/api', apiRouter)


app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app
