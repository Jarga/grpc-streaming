const chatroomService = require('../services/chatroomService')
const logger = require('../logging').createLogger('chatroomSubscription')

module.exports.subscribe = function (io, socket, videoService) {
    var user_id = socket.handshake.query.user_id

    logger.info(`User ${user_id} is attempting to join a chatroom`)
    chatroomService.joinChatroom(user_id, io, videoService)

    //Join a room for the User to get info pushed to them
    var room = (user_id) => `chat_${user_id}`
    socket.join(room(user_id))
};