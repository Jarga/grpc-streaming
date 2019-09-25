const logger = require('../logging').createLogger('uploadStream')
const activeStreamsService = require('../services/activeStreamsService')

module.exports.uploadStream = function (io, socket, videoService) {
    var user_id = socket.handshake.query.user_id

    activeStreamsService.addStream(user_id, videoService.uploadStream(
        function(error, data) {
            if (error) 
                logger.error(`Error was generated ${JSON.stringify(error, 2)}`)
            else
                logger.info(`I have no idea what this data is ${data}`)
        })
    )

    socket.on('video_chunk', function (data) {
        logger.info(`About to post some chunks for ${user_id}`)
        activeStreamsService.getStream(user_id).write({ video_id: "", chunk: data.chunk })
    })
};
