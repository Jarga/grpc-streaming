const logger = require('../logging').createLogger('videoSubscription')

let activeStreams = {}

module.exports.subscribe = function (io, socket, videoService) {
    var video_id = socket.handshake.query.video_id;
    var user_id = socket.handshake.query.user_id;

    var room = `vid_${video_id}`
    var nsp = socket.nsp.name;
    socket.join(room);

    logger.info(`User ${user_id} connected to video ${video_id}`);

    if(!activeStreams[video_id]) {
        activeStreams[video_id] = videoService.stream({ video_id: video_id, user_id: user_id, })
        activeStreams[video_id].on('data', chunk => {
            io.of(nsp).to(room).emit('video_chunk', chunk);
        })
        activeStreams[video_id].on('end', () => {
          delete activeStreams[video_id]
          iio.of(nsp).to(room).emit('video_stream_end');
          logger.info(`Video ${video_id} ended.`);
        })
    }
  
    socket.on('disconnect', function () {
        logger.info(`User ${user_id} disconnected from video ${video_id}`);
    });
};