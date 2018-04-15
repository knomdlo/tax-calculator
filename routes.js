var express = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/test', (req, res) => {
    res.send("ok now the wiring is complete")

})

module.exports = app;