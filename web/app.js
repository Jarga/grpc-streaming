// const config = require('config') TODO: determine if we actually need config here
const express = require('express')
const http = require('http')
const path = require('path')
const logging = require('./logging')
const sockets = require('./sockets')

const PORT = process.env.PORT || 3000
const logger = logging.createLogger('global')

// log global unhandled errors
process.on('unhandledRejection', error => {
  logger.error('Unhandled Promise Rejection', error)
})

process.on('uncaughtException', error => {
  logger.error('Unhandled Error', error)
})

const app = express()
const server = http.createServer(app)

// register socket stuff
sockets.register(server, logger)

// log requests
app.use(logging.createReqLogger('request'))

// app.use(express.static('static'))
app.use(express.static(path.resolve('assets')))
app.use(express.static(path.resolve('dist')))

app.get('/*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'views/index.html'))
})

// log errors in the pipeline
app.use(logging.createErrLogger('request error'))

server.listen(PORT, function() {
  logger.info(`listening on port ${PORT}!`)
})
