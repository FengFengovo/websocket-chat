import { useState, useRef, useEffect } from 'react'
import HomePage from '@/components/HomePage'
import ChatRoom from '@/components/ChatRoom'
import useWebSocket from '@/hooks/useWebSocket'
import { getRandomDefaultAvatar } from '@/utils/avatarUtils'
import { AlertContainer } from '@/components/AlertContainer'
import { showAlert } from '@/stores/alertStore'
import { 
  getUserName, 
  saveUserName, 
  getLastRoomCode, 
  saveLastRoomCode,
  getRoomPassword,
  saveRoomPassword,
  getUserAvatar,
  saveUserAvatar,
  getIsCustomAvatar,
  saveIsCustomAvatar
} from '@/utils/storage'
import { getTheme, saveTheme, applyTheme } from '@/utils/theme'
import { requestNotificationPermission, sendNotification } from '@/utils/notification'

function App() {
  const [view, setView] = useState('home') // home, chat
  const [userName, setUserName] = useState(() => getUserName()) // 从本地存储读取
  const [roomCode, setRoomCode] = useState(() => getLastRoomCode()) // 从本地存储读取
  const [customRoomCode, setCustomRoomCode] = useState('') // 自定义房间号
  const [roomPassword, setRoomPassword] = useState(() => getRoomPassword()) // 从本地存储读取
  const [joinPassword, setJoinPassword] = useState(() => getRoomPassword()) // 从本地存储读取
  const [currentRoomCode, setCurrentRoomCode] = useState('')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [users, setUsers] = useState([])
  const [userId] = useState(() => Math.random().toString(36).substring(7))
  const [userAvatar, setUserAvatar] = useState(() => {
    const savedAvatar = getUserAvatar()
    return savedAvatar || getRandomDefaultAvatar()
  }) // 用户头像，优先从本地存储读取
  const [isCustomAvatar, setIsCustomAvatar] = useState(() => getIsCustomAvatar()) // 从本地存储读取
  const fileUploadRef = useRef(null) // FileUpload组件的ref
  const [isConnecting, setIsConnecting] = useState(false) // 连接状态
  const [typingUsers, setTypingUsers] = useState(new Map()) // 正在输入的用户
  const typingTimeoutRef = useRef(new Map()) // 输入超时定时器
  const [theme, setTheme] = useState(() => getTheme()) // 主题状态
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    // 检查是否已经授权过通知权限
    return 'Notification' in window && Notification.permission === 'granted'
  }) // 通知是否启用
  const isWindowFocused = useRef(true) // 窗口是否聚焦
  const inputTimeoutRef = useRef(null) // 输入防抖定时器
  const titleFlashInterval = useRef(null) // 标题闪动定时器
  const originalTitle = useRef(document.title) // 原始标题
  const hasUnreadMessages = useRef(false) // 是否有未读消息

  // 监听用户名变化，自动保存到本地存储
  useEffect(() => {
    if (userName.trim()) {
      saveUserName(userName)
    }
  }, [userName])

  // 监听头像变化，自动保存到本地存储
  useEffect(() => {
    if (userAvatar) {
      saveUserAvatar(userAvatar)
    }
  }, [userAvatar])

  // 监听头像类型变化，自动保存到本地存储
  useEffect(() => {
    saveIsCustomAvatar(isCustomAvatar)
  }, [isCustomAvatar])

  // 初始化主题
  useEffect(() => {
    applyTheme(theme)
  }, [])

  // 监听主题变化
  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  // 切换主题
  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // 监听窗口焦点
  useEffect(() => {
    const handleFocus = () => {
      isWindowFocused.current = true
      // 窗口聚焦时停止标题闪动并恢复原标题
      if (titleFlashInterval.current) {
        clearInterval(titleFlashInterval.current)
        titleFlashInterval.current = null
      }
      document.title = originalTitle.current
      hasUnreadMessages.current = false // 清空未读标记
    }
    const handleBlur = () => {
      isWindowFocused.current = false
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      if (titleFlashInterval.current) {
        clearInterval(titleFlashInterval.current)
      }
    }
  }, [])

  // 开始标题闪动
  const startTitleFlash = () => {
    // 如果已经在闪动，不重复启动
    if (titleFlashInterval.current) return
    
    hasUnreadMessages.current = true
    let isOriginal = true
    titleFlashInterval.current = setInterval(() => {
      if (isOriginal) {
        document.title = '💬 新消息提醒'
      } else {
        document.title = originalTitle.current
      }
      isOriginal = !isOriginal
    }, 1000) // 每秒切换一次
  }

  // 请求通知权限
  const handleEnableNotification = async () => {
    const granted = await requestNotificationPermission()
    setNotificationEnabled(granted)
    if (granted) {
      showAlert("通知已启用", "你将收到新消息通知", "default")
    } else {
      showAlert("通知被拒绝", "请在浏览器设置中允许通知", "destructive")
    }
  }

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
      // 清除该用户的输入状态
      setTypingUsers(prev => {
        const newMap = new Map(prev)
        newMap.delete(data.userId)
        return newMap
      })
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
      
      // 清除该用户的输入状态
      setTypingUsers(prev => {
        const newMap = new Map(prev)
        newMap.delete(data.userId)
        return newMap
      })
      
      // 如果不是自己发送的消息，且窗口未聚焦，发送通知和标题闪动
      console.log('消息通知检查:', {
        isOtherUser: data.userId !== userId,
        notificationEnabled,
        isWindowFocused: isWindowFocused.current,
        shouldNotify: data.userId !== userId && !isWindowFocused.current
      })
      
      if (data.userId !== userId && !isWindowFocused.current) {
        // 开始标题闪动
        startTitleFlash()
        
        // 发送通知（如果已启用）
        if (notificationEnabled) {
          const messagePreview = data.file 
            ? `[${data.file.type.startsWith('image/') ? '图片' : '文件'}]` 
            : data.message.substring(0, 50)
          
          console.log('发送通知:', `${data.userName} 发来新消息`, messagePreview)
          sendNotification(`${data.userName} 发来新消息`, {
            body: messagePreview,
            tag: 'chat-message'
          })
        }
      }
      
      // 如果是文件消息且是自己发送的，通知FileUpload组件完成上传
      if (data.file && data.userId === userId && fileUploadRef.current) {
        fileUploadRef.current.completeUpload(data.file.fileId)
      }
    },
    onTyping: (data) => {
      if (data.isTyping) {
        // 用户正在输入
        setTypingUsers(prev => {
          const newMap = new Map(prev)
          newMap.set(data.userId, data.userName)
          return newMap
        })
        
        // 清除之前的超时定时器
        if (typingTimeoutRef.current.has(data.userId)) {
          clearTimeout(typingTimeoutRef.current.get(data.userId))
        }
        
        // 3秒后自动清除输入状态
        const timeout = setTimeout(() => {
          setTypingUsers(prev => {
            const newMap = new Map(prev)
            newMap.delete(data.userId)
            return newMap
          })
          typingTimeoutRef.current.delete(data.userId)
        }, 3000)
        
        typingTimeoutRef.current.set(data.userId, timeout)
      } else {
        // 用户停止输入
        setTypingUsers(prev => {
          const newMap = new Map(prev)
          newMap.delete(data.userId)
          return newMap
        })
        
        if (typingTimeoutRef.current.has(data.userId)) {
          clearTimeout(typingTimeoutRef.current.get(data.userId))
          typingTimeoutRef.current.delete(data.userId)
        }
      }
    },
    onError: (data) => {
      setIsConnecting(false)
      showAlert("错误", data.message, "destructive")
    }
  })

  // 创建房间
  const handleCreateRoom = () => {
    if (!userName.trim()) {
      showAlert("提示", "请输入用户名", "destructive")
      return
    }
    
    if (isConnecting) {
      return // 防止重复点击
    }
    
    // 保存房间信息到本地存储
    if (customRoomCode.trim()) {
      saveLastRoomCode(customRoomCode.trim())
    }
    if (roomPassword.trim()) {
      saveRoomPassword(roomPassword.trim())
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
          userAvatar: userAvatar,
          customRoomCode: customRoomCode.trim() || undefined,
          password: roomPassword.trim() || undefined
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
      showAlert("提示", "请输入用户名", "destructive")
      return
    }
    
    if (!roomCode.trim()) {
      showAlert("提示", "请输入房间码", "destructive")
      return
    }
    
    if (isConnecting) {
      return // 防止重复点击
    }
    
    // 保存房间信息到本地存储
    saveLastRoomCode(roomCode.trim())
    if (joinPassword.trim()) {
      saveRoomPassword(joinPassword.trim())
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
          userAvatar: userAvatar,
          password: joinPassword.trim() || undefined
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

  // 处理输入变化
  const handleInputChange = (value) => {
    setInputMessage(value)
    
    // 清除之前的定时器
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current)
    }
    
    // 发送正在输入状态
    if (value.trim()) {
      send({
        type: 'typing',
        isTyping: true
      })
      
      // 1秒后如果没有新的输入，发送停止输入状态
      inputTimeoutRef.current = setTimeout(() => {
        send({
          type: 'typing',
          isTyping: false
        })
      }, 1000)
    } else {
      send({
        type: 'typing',
        isTyping: false
      })
    }
  }

  // 发送消息
  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim()) return
    
    // 发送停止输入状态
    send({
      type: 'typing',
      isTyping: false
    })
    
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
    setCustomRoomCode('')
    setRoomPassword('')
    setJoinPassword('')
    // 停止标题闪动并恢复原标题
    if (titleFlashInterval.current) {
      clearInterval(titleFlashInterval.current)
      titleFlashInterval.current = null
    }
    document.title = originalTitle.current
    hasUnreadMessages.current = false // 清空未读标记
  }

  return (
    <>
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {view === 'home' && (
        <HomePage
          userName={userName}
          setUserName={setUserName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          customRoomCode={customRoomCode}
          setCustomRoomCode={setCustomRoomCode}
          roomPassword={roomPassword}
          setRoomPassword={setRoomPassword}
          joinPassword={joinPassword}
          setJoinPassword={setJoinPassword}
          userAvatar={userAvatar}
          setUserAvatar={setUserAvatar}
          isCustomAvatar={isCustomAvatar}
          setIsCustomAvatar={setIsCustomAvatar}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          isConnecting={isConnecting}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      )}
      
      {view === 'chat' && (
        <ChatRoom
          currentRoomCode={currentRoomCode}
          users={users}
          messages={messages}
          userId={userId}
          inputMessage={inputMessage}
          setInputMessage={handleInputChange}
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          onLeaveRoom={handleLeaveRoom}
          fileUploadRef={fileUploadRef}
          typingUsers={typingUsers}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          notificationEnabled={notificationEnabled}
          onEnableNotification={handleEnableNotification}
        />
      )}
    </div>
    <AlertContainer />
    </>
  )
}

export default App
