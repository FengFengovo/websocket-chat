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
import { MessageCircle, Users, Send, LogOut } from 'lucide-react'
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
  fileUploadRef
}) {
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
    <div className="w-full max-w-6xl h-[100vh] sm:h-[90vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* 聊天室头部 */}
      <div className="bg-blue-600 text-white p-3 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold">房间码: {currentRoomCode}</h2>
            <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              {users.length} 人在线
            </p>
          </div>
        </div>
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
      
      {/* 聊天主体 */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* 消息区域 */}
        <MessageList messages={messages} userId={userId} />
        
        {/* 用户列表侧边栏 */}
        <UserList users={users} userId={userId} />
      </div>
      
      {/* 输入区域 */}
      <div className="p-2 sm:p-4 bg-white border-t border-gray-200 space-y-2 sm:space-y-3">
        {/* 文件上传区域 */}
        <FileUpload ref={fileUploadRef} onFileSelect={onSendFile} />
        
        {/* 消息输入框 */}
        <form onSubmit={onSendMessage}>
          <div className="flex gap-2 sm:gap-3">
            <Input
              type="text"
              placeholder="输入消息或粘贴图片..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPaste={handlePaste}
              className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
            />
            <Button 
              type="submit" 
              size="default"
              className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 px-3 sm:px-4"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">发送</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
