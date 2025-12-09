const STORAGE_KEYS = {
    USER_NAME: 'chat_user_name',
    LAST_ROOM_CODE: 'chat_last_room_code',
    LAST_ROOM_PASSWORD: 'chat_last_room_password',
    USER_AVATAR: 'chat_user_avatar',
    IS_CUSTOM_AVATAR: 'chat_is_custom_avatar'
}

// 保存用户名
export const saveUserName = (userName) => {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_NAME, userName)
    } catch (error) {
        console.error('保存用户名失败:', error)
    }
}

// 获取用户名
export const getUserName = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.USER_NAME) || ''
    } catch (error) {
        console.error('获取用户名失败:', error)
        return ''
    }
}

// 保存上次使用的房间号
export const saveLastRoomCode = (roomCode) => {
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_ROOM_CODE, roomCode)
    } catch (error) {
        console.error('保存房间号失败:', error)
    }
}

// 获取上次使用的房间号
export const getLastRoomCode = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.LAST_ROOM_CODE) || ''
    } catch (error) {
        console.error('获取房间号失败:', error)
        return ''
    }
}

// 保存房间密码
export const saveRoomPassword = (password) => {
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_ROOM_PASSWORD, password)
    } catch (error) {
        console.error('保存房间密码失败:', error)
    }
}

// 获取房间密码
export const getRoomPassword = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.LAST_ROOM_PASSWORD) || ''
    } catch (error) {
        console.error('获取房间密码失败:', error)
        return ''
    }
}

// 保存用户头像
export const saveUserAvatar = (avatar) => {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_AVATAR, avatar)
    } catch (error) {
        console.error('保存用户头像失败:', error)
    }
}

// 获取用户头像
export const getUserAvatar = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.USER_AVATAR) || ''
    } catch (error) {
        console.error('获取用户头像失败:', error)
        return ''
    }
}

// 保存是否自定义头像
export const saveIsCustomAvatar = (isCustom) => {
    try {
        localStorage.setItem(STORAGE_KEYS.IS_CUSTOM_AVATAR, String(isCustom))
    } catch (error) {
        console.error('保存头像类型失败:', error)
    }
}

// 获取是否自定义头像
export const getIsCustomAvatar = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.IS_CUSTOM_AVATAR) === 'true'
    } catch (error) {
        console.error('获取头像类型失败:', error)
        return false
    }
}

// 清除所有存储的数据
export const clearAllStorage = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key)
        })
    } catch (error) {
        console.error('清除存储失败:', error)
    }
}
