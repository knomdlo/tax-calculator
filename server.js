let expressConfig = require('./routes')
let http = require('http').Server(expressConfig)
let mongoose = require('mongoose')

let dbUrl = 'mongodb://tax:tax@ds143099.mlab.com:43099/tax'

mongoose.connect(dbUrl, { useMongoClient: true }, (err) => {
	if(err) {
		console.log('mongo db connection', err)
	}
	else {
		console.log('DB connected')
	}
    
})
let server = http.listen(process.env.PORT || 4000, () => {
	console.log('server is listening on port', server.address().port)
})