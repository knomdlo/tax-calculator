var expressConfig = require('./routes')
var http = require('http').Server(expressConfig)

var server = http.listen(4000, () => {
    console.log('server is listening on port', server.address().port)
})