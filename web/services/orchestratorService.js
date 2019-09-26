const logger = require('../logging').createLogger('Initialize Socket')
const activeUsersService = require('./activeUsersService')
const activeStreamsService = require('./activeUsersService')

const init = (io, socket, chatService, videoService) => {
    const user_id = socket.handshake.query.user_id
    // TODO do we need thsi
    const video_id = ''

    logger.info(`Initializing Socket for ${user_id}`)

    const userInfo = activeUsersService.createUserInfo(user_id, video_id, socket)
    logger.info(`User ${user_id} create user info after uploading ${JSON.stringify(userInfo, 2)}`)

    socket.on('disconnect', function () {
        logger.info(`Disconnecting Socket for ${user_id}`)
        activeStreamsService.endStream(user_id)
        activeUsersService.purgeUserInfo(user_id)
        logger.info(`User ${user_id} disconnected video`)
    });

    socket.on('change_chatroom', function (data) {
        chatroomService.joinChatroom(user_id, io, videoService)
    })
}

module.exports = {
    init
}