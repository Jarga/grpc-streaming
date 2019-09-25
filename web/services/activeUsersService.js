var activeUsersRepository = require('../repositories/activeUsersRepository')

const getAvailableUser = (user_id) => {
    const availableUsers = activeUsersRepository.getAvailableUsers().filter(key => key != user_id)

    return availableUsers[0]
}


const markUsersAsUnavailable = (user_ids = []) => {
    user_ids.forEach(id => {
        const info = activeUsersRepository.getUserInfo(id)
        activeUsersRepository.updateUserInfo({
            ...info,
            isAvailable: false,
        })
    });
}

const markUsersAsAvailable = (user_ids = []) => {
    user_ids.forEach(id => {
        const info = activeUsersRepository.getUserInfo(id)
        activeUsersRepository.updateUserInfo({
            ...info,
            isAvailable: true,
        })
    });
}

const getUserInfo = (user_id) => activeUsersRepository.getUserInfo(user_id)
const createUserInfo = (user_id, video_id, socket) => 
    activeUsersRepository.createUserInfo(user_id, video_id, socket)

function purgeUserInfo(user_id) {
    activeUsersRepository.purgeUserInfo(user_id)
}

module.exports = {
    createUserInfo,
    getAvailableUser,
    getUserInfo,
    markUsersAsUnavailable,
    markUsersAsAvailable,
    purgeUserInfo,
}