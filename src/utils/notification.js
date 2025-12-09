// 请求通知权限
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('浏览器不支持通知')
        return false
    }

    if (Notification.permission === 'granted') {
        return true
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
    }

    return false
}

// 发送通知
export function sendNotification(title, options = {}) {
    console.log('sendNotification 被调用:', title, options)

    if (!('Notification' in window)) {
        console.log('浏览器不支持通知')
        return
    }

    console.log('通知权限状态:', Notification.permission)

    if (Notification.permission === 'granted') {
        console.log('创建通知...')
        const notification = new Notification(title, {
            icon: '/vite.svg',
            badge: '/vite.svg',
            ...options
        })

        // 点击通知时聚焦窗口
        notification.onclick = () => {
            console.log('通知被点击')
            window.focus()
            notification.close()
        }

        // 3秒后自动关闭
        setTimeout(() => {
            notification.close()
        }, 3000)

        return notification
    } else {
        console.log('通知权限未授予')
    }
}

// 检查是否支持通知
export function isNotificationSupported() {
    return 'Notification' in window
}

// 获取通知权限状态
export function getNotificationPermission() {
    if (!('Notification' in window)) {
        return 'unsupported'
    }
    return Notification.permission
}
