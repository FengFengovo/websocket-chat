import { useRef, useCallback } from 'react'
import { showAlert } from '@/stores/alertStore'

export default function useWebSocket({
    onRoomCreated,
    onRoomJoined,
    onUserJoined,
    onUserLeft,
    onChatMessage,
    onError
}) {
    const wsRef = useRef(null)
    const connectionTimeoutRef = useRef(null)

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
    }, [onRoomCreated, onRoomJoined, onUserJoined, onUserLeft, onChatMessage, onError])

    // 发送消息
    const send = useCallback((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data))
            return true
        }
        return false
    }, [])

    // 关闭连接
    const close = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }
    }, [])

    return { connect, send, close, wsRef }
}
