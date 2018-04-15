let expressConfig = require('./routes')
let http = require('http').Server(expressConfig)

let server = http.listen(4000, () => {
    console.log('server is listening on port', server.address().port)
})