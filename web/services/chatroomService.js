const logger = require('../logging').createLogger('ChatroomService')
const activeUsersService = require('../services/activeUsersService')
const chatroomRepository = require('../repositories/chatroomRepository')

/* Private Functions */
const exitChatroom = (user_id) => {
    const chatroom = chatroomRepository.getUsersChatroom(user_id)

    if (!chatroom) {
        logger.info(`User ${user_id} could not exit chatroom; it wasn't in one`)
        return
    }
    else if (chatroom.users.length === 1) {
        activeUsersService.markUsersAsAvailable(chatroom.users)
        chatroomRepository.deleteChatroom(chatroom.chat_id)
    }
    else {
        activeUsersService.markUsersAsAvailable(chatroom.users)
        chatroomRepository.updateChatroom(chatroom.chat_id, {
            ...chatroom,
            users: chatroom.users.filter(user => user !== user_id),
        })
    }

    chatroom.streams.forEach(stream => {
        stream.end()
    })
}

/* Public Functions */
const joinChatroom = (user_id, io, videoService) => {
    const new_active_user_id = activeUsersService.getAvailableUser(user_id)

    exitChatroom(user_id)
    let chatroom
    if (!new_active_user_id) {
        //Join a chatroom
        chatroom = chatroomRepository.createChatroom([user_id])

        logger.info(`User ${user_id} has created a chatroom and waiting for someone to join`)
        
    } else { 
        chatroom = chatroomRepository.joinUsersChatroom(user_id, new_active_user_id)

        activeUsersService.markUsersAsUnavailable([user_id, new_active_user_id])
        initializeChatroom(user_id, io, videoService)
    }

    return chatroom
}

const initializeChatroom = (user_id, io, videoService) => {
    var room = (user_id) => `chat_${user_id}`
    const chatroom = chatroomRepository.getUsersChatroom(user_id)
    const usersInfo = chatroom.users.map(uid => activeUsersService.getUserInfo(uid))

    if (usersInfo.length > 2)
        logger.info(`Too many users in chat room (ignoring > 2) ${chatroom.chat_id}: ${users}`)

    const userA = usersInfo[0];
    const userAStream = videoService.stream({ 
        video_id: userA.video_id,
        user_id: userA.user_id
    })

    const userB = usersInfo[1];
    const userBStream = videoService.stream({ 
        video_id: userB.video_id,
        user_id: userB.user_id
    })

    userAStream.on('data', chunk => {
        io.of(userB.socket.nsp.name).to(room(userB.user_id)).emit('video_chunk', chunk)
    })

    userBStream.on('data', chunk => {
        io.of(userA.socket.nsp.name).to(room(userA.user_id)).emit('video_chunk', chunk)
    })

    chatroomRepository.updateChatroom(chatroom.chat_id, {
        ...chatroom,
        streams: [
            userAStream,
            userBStream,
        ]
    })
}

module.exports = {
    joinChatroom,
    initializeChatroom,
}