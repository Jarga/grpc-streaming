const { activeUsers: users } = require('./stateManagementRepository').getState()

const getAvailableUsers = () => Object.keys(users)
        .filter(key => users[key].isAvailable)
        .sort((a, b) => users[b].availableAt - users[a].availableAt)

const createUserInfo = (user_id, video_id, socket) => {
    const userInformation = {
        isAvailable: true,
        availableAt: new Date(),
        video_id,
        //TODO Cannot Use the socket because it's a circular reference
        // socket
    }

    users[user_id] = userInformation
    return userInformation
}

const updateUserInfo = (user_id, userInfo) => {
    users[user_id] = {
        ...userInfo,
    }
}

const getUserInfo = (user_id) => ({
    ...users[user_id],
    user_id,
})

const purgeUserInfo = (user_id) => {
    delete users[user_id]
}

module.exports = {
    getAvailableUsers,
    createUserInfo,
    updateUserInfo,
    getUserInfo,
    purgeUserInfo,
}
