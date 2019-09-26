const { chatrooms } = require('./stateManagementRepository').getState()

let chatId = 0
const createChatroom = (users) => {
    const chatroom = {
        chat_id: chatId++,
        createdAt: new Date(),
        streams: [],
        users,
    }

    chatrooms[chatId] = chatroom
    return chatroom
}

const getUsersChatroom = (user_id) => {
    if (chatrooms.length <= 0) return undefined

    return chatrooms.filter(cr => cr.users.some(user => user === user_id))[0]
}

const updateChatroom = (chat_id, chatroom) => {
    chatrooms[chat_id] = {
        ...chatroom,
    }

    return chatrooms[chat_id]
}

const joinUsersChatroom = (user_id, other_user_id) => {
    const chatroom = getUsersChatroom(other_user_id)
    chatroom.users.push(user_id)
    return chatroom
}

const deleteChatroom = (chat_id) => {


}

module.exports = {
    createChatroom,
    updateChatroom,
    deleteChatroom,
    getUsersChatroom,
    joinUsersChatroom,
}