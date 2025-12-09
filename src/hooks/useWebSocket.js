import { useRef, useCallback } from 'react'
import { showAlert } from '@/stores/alertStore'

export default function useWebSocket({
    onRoomCreated,
    onRoomJoined,
    onUserJoined,
    onUserLeft,
    onChatMessage,
    onTyping,
    onError
}) {
    const wsRef = useRef(null)
    const connectionTimeoutRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)
    const reconnectAttemptsRef = useRef(0)
    const maxReconnectAttempts = 5
    const roomInfoRef = useRef(null) // 保存房间信息用于重连

    // 连接 WebSocket
    const connect = useCallback(() => {
        // 根据环境自动选择 WebSocket 地址
        const wsUrl = import.meta.env.PROD
            ? 'wss://websocket-chat-cwkj.onrender.com' // 生产环境
            : 'ws://localhost:3001' // 开发环境

        console.log('正在连接 WebSocket:', wsUrl)
        const ws = new WebSocket(wsUrl)

        // 设置连接超时（30秒）
        connectionTimeoutRef.current = setTimeout(() => {
            if (ws.readyState !== WebSocket.OPEN) {
                ws.close()
                console.error('WebSocket 连接超时')
                showAlert("连接超时", "连接服务器超时，请检查网络连接或稍后重试", "destructive")
            }
        }, 30000)

        ws.onopen = () => {
            console.log('WebSocket 连接成功')
            // 清除超时定时器
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current)
                connectionTimeoutRef.current = null
            }
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            switch (data.type) {
                case 'room_created':
                    onRoomCreated?.(data)
                    break

                case 'room_joined':
                    onRoomJoined?.(data)
                    break

                case 'user_joined':
                    onUserJoined?.(data)
                    break

                case 'user_left':
                    onUserLeft?.(data)
                    break

                case 'chat_message':
                    onChatMessage?.(data)
                    break

                case 'typing':
                    onTyping?.(data)
                    break

                case 'error':
                    onError?.(data)
                    break
            }
        }

        ws.onclose = (event) => {
            console.log('WebSocket 连接关闭', event.code, event.reason)
            // 清除超时定时器
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current)
                connectionTimeoutRef.current = null
            }

            // 如果不是正常关闭且有房间信息，尝试重连
            if (event.code !== 1000 && roomInfoRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
                reconnectAttemptsRef.current++
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 10000) // 指数退避，最多10秒

                console.log(`尝试重连 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})，${delay}ms后重试...`)
                showAlert("连接断开", `正在尝试重连 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`, "default")

                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('开始重连...')
                    const newWs = connect()

                    // 等待连接建立后重新加入房间
                    const checkConnection = setInterval(() => {
                        if (newWs.readyState === WebSocket.OPEN) {
                            clearInterval(checkConnection)
                            console.log('重连成功，重新加入房间...')

                            // 重新加入房间
                            if (roomInfoRef.current) {
                                newWs.send(JSON.stringify({
                                    type: 'join_room',
                                    ...roomInfoRef.current
                                }))
                            }

                            // 重置重连计数
                            reconnectAttemptsRef.current = 0
                        } else if (newWs.readyState === WebSocket.CLOSED || newWs.readyState === WebSocket.CLOSING) {
                            clearInterval(checkConnection)
                        }
                    }, 100)
                }, delay)
            } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                showAlert("连接失败", "无法连接到服务器，请刷新页面重试", "destructive")
                reconnectAttemptsRef.current = 0
            }
        }

        ws.onerror = (error) => {
            console.error('WebSocket 错误:', error)
            console.error('WebSocket readyState:', ws.readyState)
            console.error('尝试连接的 URL:', wsUrl)

            // 清除超时定时器
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current)
                connectionTimeoutRef.current = null
            }

            showAlert("连接失败", "连接服务器失败，请确保服务器正在运行。可能的原因：1. 服务器正在启动（首次访问需要等待30秒） 2. 网络连接问题 3. 服务器维护中", "destructive")
        }

        wsRef.current = ws
        return ws
    }, [onRoomCreated, onRoomJoined, onUserJoined, onUserLeft, onChatMessage, onTyping, onError])

    // 发送消息
    const send = useCallback((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // 保存房间信息用于重连
            if (data.type === 'create_room' || data.type === 'join_room') {
                roomInfoRef.current = {
                    roomCode: data.roomCode || data.customRoomCode,
                    userId: data.userId,
                    userName: data.userName,
                    userAvatar: data.userAvatar,
                    password: data.password
                }
            }

            wsRef.current.send(JSON.stringify(data))
            return true
        }
        return false
    }, [])

    // 关闭连接
    const close = useCallback(() => {
        // 清除重连定时器
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }

        // 清除房间信息
        roomInfoRef.current = null
        reconnectAttemptsRef.current = 0

        if (wsRef.current) {
            wsRef.current.close(1000, 'User closed connection') // 正常关闭
            wsRef.current = null
        }
    }, [])

    return { connect, send, close, wsRef }
}
