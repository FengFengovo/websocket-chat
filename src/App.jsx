import { useState, useRef } from 'react'
import HomePage from '@/components/HomePage'
import ChatRoom from '@/components/ChatRoom'
import useWebSocket from '@/hooks/useWebSocket'
import { getRandomDefaultAvatar } from '@/utils/avatarUtils'

function App() {
  const [view, setView] = useState('home') // home, chat
  const [userName, setUserName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [currentRoomCode, setCurrentRoomCode] = useState('')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [users, setUsers] = useState([])
  const [userId] = useState(() => Math.random().toString(36).substring(7))
  const [userAvatar, setUserAvatar] = useState(() => getRandomDefaultAvatar()) // 用户头像，默认随机选择
  const [isCustomAvatar, setIsCustomAvatar] = useState(false) // 标记是否为用户自定义头像
  const fileUploadRef = useRef(null) // FileUpload组件的ref
  const [isConnecting, setIsConnecting] = useState(false) // 连接状态

  // WebSocket Hook
  const { connect, send, close } = useWebSocket({
    onRoomCreated: (data) => {
      setIsConnecting(false)
      setCurrentRoomCode(data.roomCode)
      setUsers(data.users)
      setView('chat')
    },
    onRoomJoined: (data) => {
      setIsConnecting(false)
      setCurrentRoomCode(data.roomCode)
      setUsers(data.users)
      setView('chat')
    },
    onUserJoined: (data) => {
      setUsers(data.users)
      setMessages(prev => [...prev, {
        type: 'system',
        message: `${data.user.name} 加入了房间`,
        timestamp: Date.now()
      }])
    },
    onUserLeft: (data) => {
      setUsers(data.users)
      setMessages(prev => [...prev, {
        type: 'system',
        message: `${data.userName} 离开了房间`,
        timestamp: Date.now()
      }])
    },
    onChatMessage: (data) => {
      setMessages(prev => [...prev, {
        type: 'chat',
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        message: data.message,
        file: data.file, // 添加文件数据
        timestamp: data.timestamp
      }])
      
      // 如果是文件消息且是自己发送的，通知FileUpload组件完成上传
      if (data.file && data.userId === userId && fileUploadRef.current) {
        fileUploadRef.current.completeUpload(data.file.fileId)
      }
    },
    onError: (data) => {
      setIsConnecting(false)
      alert(data.message)
    }
  })

  // 创建房间
  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert('请输入用户名')
      return
    }
    
    if (isConnecting) {
      return // 防止重复点击
    }
    
    setIsConnecting(true)
    const ws = connect()
    
    // 等待连接建立后发送创建房间消息
    const checkConnection = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        clearInterval(checkConnection)
        send({
          type: 'create_room',
          userId: userId,
          userName: userName,
          userAvatar: userAvatar
        })
      } else if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        clearInterval(checkConnection)
        setIsConnecting(false)
      }
    }, 100)
    
    // 30秒超时保护
    setTimeout(() => {
      clearInterval(checkConnection)
      if (isConnecting) {
        setIsConnecting(false)
      }
    }, 30000)
  }

  // 加入房间
  const handleJoinRoom = () => {
    if (!userName.trim()) {
      alert('请输入用户名')
      return
    }
    
    if (!roomCode.trim()) {
      alert('请输入房间码')
      return
    }
    
    if (isConnecting) {
      return // 防止重复点击
    }
    
    setIsConnecting(true)
    const ws = connect()
    
    // 等待连接建立后发送加入房间消息
    const checkConnection = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        clearInterval(checkConnection)
        send({
          type: 'join_room',
          roomCode: roomCode.toUpperCase(),
          userId: userId,
          userName: userName,
          userAvatar: userAvatar
        })
      } else if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        clearInterval(checkConnection)
        setIsConnecting(false)
      }
    }, 100)
    
    // 30秒超时保护
    setTimeout(() => {
      clearInterval(checkConnection)
      if (isConnecting) {
        setIsConnecting(false)
      }
    }, 30000)
  }

  // 发送消息
  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim()) return
    
    send({
      type: 'chat_message',
      message: inputMessage
    })
    setInputMessage('')
  }

  // 发送文件
  const handleSendFile = (fileData) => {
    if (fileData.isChunk) {
      // 发送文件块
      send({
        type: 'file_chunk',
        fileId: fileData.fileId,
        chunkIndex: fileData.chunkIndex,
        totalChunks: fileData.totalChunks,
        chunk: fileData.chunk,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize
      })
    } else {
      // 小文件直接发送
      send({
        type: 'chat_message',
        message: '', // 文件消息不需要文本内容
        file: fileData
      })
    }
  }

  // 离开房间
  const handleLeaveRoom = () => {
    close()
    setView('home')
    setMessages([])
    setUsers([])
    setCurrentRoomCode('')
    setRoomCode('')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      {view === 'home' && (
        <HomePage
          userName={userName}
          setUserName={setUserName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          userAvatar={userAvatar}
          setUserAvatar={setUserAvatar}
          isCustomAvatar={isCustomAvatar}
          setIsCustomAvatar={setIsCustomAvatar}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          isConnecting={isConnecting}
        />
      )}
      
      {view === 'chat' && (
        <ChatRoom
          currentRoomCode={currentRoomCode}
          users={users}
          messages={messages}
          userId={userId}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          onLeaveRoom={handleLeaveRoom}
          fileUploadRef={fileUploadRef}
        />
      )}
    </div>
  )
}

export default App
