import { useRef, useCallback } from 'react'

export default function useWebSocket({
    onRoomCreated,
    onRoomJoined,
    onUserJoined,
    onUserLeft,
    onChatMessage,
    onError
}) {
    const wsRef = useRef(null)

    // 连接 WebSocket
    const connect = useCallback(() => {
        // 根据环境自动选择 WebSocket 地址
        const wsUrl = import.meta.env.PROD
            ? 'wss://websocket-chat-server.onrender.com' // 生产环境（部署后需要修改为你的实际域名）
            : 'ws://localhost:3001' // 开发环境

        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
            console.log('WebSocket 连接成功')
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

        ws.onclose = () => {
            console.log('WebSocket 连接关闭')
        }

        ws.onerror = (error) => {
            console.error('WebSocket 错误:', error)
            alert('连接服务器失败，请确保服务器正在运行')
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
