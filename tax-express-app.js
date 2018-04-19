const express = require('express');
const bodyParser = require('body-parser')
const apiRouter = require('./routes')
const path = require('path');

function taxExpressApp() {
  const app = express()

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use('/api', apiRouter())

  app.use('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'index.html'))
  });

  return app
}

module.exports = taxExpressApp
