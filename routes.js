let express = require('express')
let bodyParser = require('body-parser')
let app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/test', (req, res) => {
    res.send("ok now the wiring is complete")
})

module.exports = app;