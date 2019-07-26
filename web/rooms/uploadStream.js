const logger = require('../logging').createLogger('uploadStream')

let activeStreams = {}

module.exports.uploadStream = function (io, socket, videoService) {
    var user_id = socket.handshake.query.user_id;

    logger.info(`User ${user_id} started video`);

    //TODO: Manage activeStreams better, this can cause issues with multiple open streams
    activeStreams[user_id] = videoService.uploadStream(function(error, data) {
        console.log('Func call', error, JSON.stringify(data));
    })
    socket.on('video_chunk', function (data) {
        //TODO: Allow setting name/id/etc
        activeStreams[user_id].write({ video_id: "", chunk: data.chunk })
    })
    socket.on('disconnect', function () {
        activeStreams[user_id].end()
        logger.info(`User ${user_id} disconnected video`);
    });
};
