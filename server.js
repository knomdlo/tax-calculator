const expressConfig = require('./routes')
const express = require('express')
const bodyParser = require('body-parser')
const taxExpressApp = require('./tax-express-app')
const http = require('http').Server(taxExpressApp())
const mongoose = require('mongoose')
const apiRouter = require('./routes')

require('dotenv').config()

mongoose.Promise = Promise
mongoose.connect(process.env.DB_URL, { useMongoClient: true }, (err) => {
	(err) ? console.log('mongo db connection', err) : console.log('DB connected')
})

let server = http.listen(process.env.PORT || 4000, () => {
	console.log('server is listening on port', server.address().port)
})