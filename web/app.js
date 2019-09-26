const bodyParser = require('body-parser')
const express = require('express')
const https = require('https')
const http = require('http')
const path = require('path')
const socket_io = require('socket.io')
const config = require('config')
const cors = require('cors')
const fs = require('fs')

const logging = require('./logging')

const PORT = process.env.PORT || 3000
const logger = logging.createLogger('global')

const videoService = require('./services/grpc/videoService').create()
const chatService = require('./services/grpc/chatService').create()
const orchestrator = require('./services/orchestratorService')
const commentStreamRoom = require('./rooms/commentStream')
const chatroomStreamRoom = require('./rooms/chatroomStream')
const uploadStreamRoom = require('./rooms/uploadStream')

const stateManager = require('./repositories/stateManagementRepository')

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
// const server = https.createServer({
//   key: fs.readFileSync('./server.key'),
//   cert: fs.readFileSync('./server.cert')
// }, app)

// register socket stuff
const io = socket_io.listen(server)

io.on('connection', function(socket) {
  orchestrator.init(io, socket, chatService, videoService)
})

io.of('/streams').on('connection', function(socket) {
  commentStreamRoom.subscribe(io, socket, chatService)
  chatroomStreamRoom.subscribe(io, socket, videoService)
})

io.of('/uploads').on('connection', function(socket) {
  uploadStreamRoom.uploadStream(io, socket, videoService)
})

app.use(cors())
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

app.get('/diagnostics', function (req, res) {
  res.json(stateManager.getState())
})

app.get('/*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'views/index.html'))
})

// log errors in the pipeline
app.use(logging.createErrLogger('request error'))

server.listen(PORT, function() {
  logger.info(`listening on port ${PORT}!`)
})
