const grpc = require('grpc')
const socket_io = require('socket.io')
const protoLoader = require('@grpc/proto-loader')

const chatProto = protoLoader.loadSync('./protos/chat.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const chat_proto = grpc.loadPackageDefinition(chatProto).Chat

const streamProto = protoLoader.loadSync('./protos/video.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const video_proto = grpc.loadPackageDefinition(streamProto).VideoStream

module.exports.register = (server, logger) => {
  const io = socket_io.listen(server)
  let streams = {}

  io.of('/comments').on('connection', function(socket) {
    if (!streams['comments']) {
      try {
        let client = new chat_proto.Chat('localhost:5000', grpc.credentials.createInsecure())
        streams['comments'] = client.join({
          video_id: 'TEST',
          user_id: 'SERVER1',
        })
        streams['comments'].on('data', chunk => {
          socket.broadcast.emit('chunk', chunk)
          logger.info('Sent comment chunk', chunk)
        })
      } catch (e) {
        logger.error('Error', e)
      }
    }

    socket.on('disconnect', function() {
      logger.info('Disconnect')
    })
  })

  io.of('/stream').on('connection', function(socket) {
    if (!streams['stream']) {
      try {
        let client = new video_proto.VideoStream(
          'localhost:5010',
          grpc.credentials.createInsecure()
        )
        streams['stream'] = client.stream({
          video_id: 'TEST',
          user_id: 'SERVER1',
        })
        streams['stream'].on('data', chunk => {
          socket.emit('chunk', chunk)
          logger.info('Sent video chunk', chunk.chunk.length)
        })
        streams['stream'].on('end', () => {
          delete streams['stream']
          socket.emit('stream_end')
          logger.info('video end')
        })
      } catch (e) {
        logger.error('Error', e)
      }
    }

    socket.on('disconnect', function() {
      logger.info('Disconnect')
    })
  })
}
