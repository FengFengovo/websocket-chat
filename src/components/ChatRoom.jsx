import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { MessageCircle, Users, Send, LogOut, Moon, Sun, Bell, BellOff } from 'lucide-react'
import MessageList from './MessageList'
import UserList from './UserList'
import FileUpload from './FileUpload'
import { showAlert } from '@/stores/alertStore'

export default function ChatRoom({ 
  currentRoomCode, 
  users, 
  messages, 
  userId,
  inputMessage,
  setInputMessage,
  onSendMessage,
  onSendFile,
  onLeaveRoom,
  fileUploadRef,
  typingUsers,
  theme,
  onToggleTheme,
  notificationEnabled,
  onEnableNotification
}) {
  const [isDragging, setIsDragging] = useState(false)

  // 处理拖拽进入
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  // 处理拖拽离开
  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // 只有当离开整个聊天区域时才取消拖拽状态
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  // 处理拖拽悬停
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // 处理文件放置
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // 检查文件大小（限制为1GB）
      if (file.size > 1024 * 1024 * 1024) {
        showAlert("错误", "文件大小不能超过1GB", "destructive")
        return
      }

      // 将文件转换为base64格式
      const reader = new FileReader()
      
      reader.onloadend = () => {
        const fileId = Date.now() + '_' + Math.random().toString(36).substring(7)
        
        // 发送文件数据
        onSendFile({
          fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result
        })
      }
      
      reader.onerror = () => {
        showAlert("错误", "文件读取失败，请重试", "destructive")
      }
      
      reader.readAsDataURL(file)
    }
  }

  // 处理粘贴事件
  const handlePaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    // 遍历粘贴的内容
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // 检查是否为图片
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault() // 阻止默认粘贴行为
        
        const file = item.getAsFile()
        if (file) {
          // 检查文件大小（限制为1GB）
          if (file.size > 1024 * 1024 * 1024) {
            showAlert("错误", "文件大小不能超过1GB", "destructive")
            return
          }

          // 将文件转换为base64格式
          const reader = new FileReader()
          
          reader.onloadend = () => {
            const fileId = Date.now() + '_' + Math.random().toString(36).substring(7)
            
            // 发送文件数据
            onSendFile({
              fileId,
              name: file.name,
              type: file.type,
              size: file.size,
              data: reader.result
            })
          }
          
          reader.onerror = () => {
            showAlert("错误", "图片读取失败，请重试", "destructive")
          }
          
          reader.readAsDataURL(file)
        }
        break
      }
    }
  }
  return (
    <div 
      className="w-full max-w-6xl h-[100vh] sm:h-[90vh] bg-white dark:bg-gray-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative transition-colors duration-300"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 拖拽遮罩层 */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-blue-500 rounded-2xl">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-2xl font-bold text-blue-600 mb-2">拖放文件到这里</p>
            <p className="text-gray-500">支持图片、文档等文件，最大1GB</p>
          </div>
        </div>
      )}
      {/* 聊天室头部 */}
      <div className="bg-pink-400 dark:bg-gray-900 text-white sm:p-6 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-white/20 dark:bg-white/10 p-1.5 sm:p-2 rounded-lg">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-l font-bold">房间码: {currentRoomCode}</h2>
            <p className="text-xs sm:text-sm text-blue-100 dark:text-gray-300 flex items-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              {users.length} 人在线
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 通知开关按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onEnableNotification}
            className="text-white hover:bg-white/20 dark:hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
            title={notificationEnabled ? "通知已启用" : "启用通知"}
          >
            {notificationEnabled ? <Bell className="w-4 h-4 sm:w-5 sm:h-5" /> : <BellOff className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
          
          {/* 主题切换按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="text-white hover:bg-white/20 dark:hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
            title={theme === 'light' ? "切换到夜间模式" : "切换到日间模式"}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs sm:text-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">离开房间</span>
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认离开房间？</AlertDialogTitle>
              <AlertDialogDescription>
                你确定要离开当前房间吗？离开后聊天记录将会清空。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={onLeaveRoom}>
                确认离开
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* 聊天主体 */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* 消息区域 */}
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} userId={userId} />
          
          {/* 正在输入提示 */}
          {typingUsers && typingUsers.size > 0 && (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
              {Array.from(typingUsers.values()).join('、')} 正在输入...
            </div>
          )}
        </div>
        
        {/* 用户列表侧边栏 */}
        <UserList users={users} userId={userId} />
      </div>
      
      {/* 输入区域 */}
      <div className="p-2 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-2 sm:space-y-3">
        {/* 文件上传区域 */}
        <FileUpload ref={fileUploadRef} onFileSelect={onSendFile} />
        
        {/* 消息输入框 */}
        <form onSubmit={onSendMessage}>
          <div className="relative">
            <textarea
              placeholder="输入消息或粘贴图片..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                // 按Enter发送，Shift+Enter换行
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSendMessage(e)
                }
              }}
              className="w-full min-h-[60px] max-h-[180px] sm:min-h-[80px] sm:max-h-[240px] text-sm sm:text-base px-3 py-2 pb-12 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              rows="1"
              style={{
                lineHeight: '1.5',
                scrollbarWidth: 'thin'
              }}
            />
            <button 
              type="submit" 
              className="absolute right-2 bottom-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 text-sm font-medium transition-colors"
            >
              发送
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
