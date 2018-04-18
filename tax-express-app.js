const express = require('express');
const bodyParser = require('body-parser')
const apiRouter = require('./routes')

function taxExpressApp() {
  const app = express()

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use('/api', apiRouter())

  return app
}

module.exports = taxExpressApp
