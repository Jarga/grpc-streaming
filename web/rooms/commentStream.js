const logger = require('../logging').createLogger('commentSubscription')

let activeStreams = {}

module.exports.subscribe = function (io, socket, chatService) {
    var video_id = socket.handshake.query.video_id;
    var user_id = socket.handshake.query.user_id;

    var room = `com_${video_id}`
    var nsp = socket.nsp.name;
    socket.join(room);

    logger.info(`User ${user_id} connected to video ${video_id}`);

    if(!activeStreams[video_id]) {
        activeStreams[video_id] = chatService.join({ video_id: video_id, user_id: user_id })

        activeStreams[video_id].on('data', chunk => {
            io.of(nsp).to(room).emit('comment_chunk', chunk);
        })
        activeStreams[video_id].on('end', () => {
          delete activeStreams[video_id]
          io.of(nsp).to(room).emit('comment_stream_end');
          logger.info(`Video ${video_id} ended.`);
        })
    }
  
    socket.on('connect', function (data) {
        chatService.send({ video_id: video_id, user_id: user_id, content: `User ${user_id} joined` }, (error, response) => {
            if (error) { logger.error(error); }
        })
    });
  
    socket.on('comment', function (data) {
        chatService.send({ video_id: video_id, user_id: user_id, content: data }, (error, response) => {
            if (error) { logger.error(error); }
        })
    });

    socket.on('disconnect', function () {
        logger.info(`User ${user_id} disconnected from video ${video_id}`);
    });
};