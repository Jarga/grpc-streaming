const bodyParser = require('body-parser')
const express = require('express')
const http = require('http')
const path = require('path')
const socket_io = require('socket.io')
const config = require('config');

const logging = require('./logging')

const PORT = process.env.PORT || 3000
const logger = logging.createLogger('global')

const videoService = require('./services/videoService').create()
const chatService = require('./services/chatService').create()
const commentStreamRoom = require('./rooms/commentStream')
const videoStreamRoom = require('./rooms/videoStream')
const uploadStreamRoom = require('./rooms/uploadStream')

logger.info(`CONFIG: ${JSON.stringify(config)}`)

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
const io = socket_io.listen(server)

io.of('/streams').on('connection', function(socket) {
  commentStreamRoom.subscribe(io, socket, chatService)
  videoStreamRoom.subscribe(io, socket, videoService)
})

io.of('/uploads').on('connection', function(socket) {
  uploadStreamRoom.uploadStream(io, socket, videoService)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// log requests
app.use(logging.createReqLogger('request'))

// app.use(express.static('static'))
app.use(express.static(path.resolve('assets')))
app.use(express.static(path.resolve('dist')))

app.all('*', function (req, res, next) {
  req.videoService = videoService
  req.chatService = chatService
  next()
});

const videoHandlers = require('./handlers/videos')

Object.keys(videoHandlers).forEach(key => {
  var handlerEntry = videoHandlers[key]

  app[handlerEntry.type](`/api/videos/${key}`, handlerEntry.handler);
});
// log errors in the pipeline
app.use(logging.createErrLogger('request error'))

server.listen(PORT, function() {
  logger.info(`listening on port ${PORT}!`)
})
