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
  return (
    <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* 聊天室头部 */}
      <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">房间码: {currentRoomCode}</h2>
            <p className="text-blue-100 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {users.length} 人在线
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              离开房间
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
      <div className="flex-1 flex overflow-hidden">
        {/* 消息区域 */}
        <MessageList messages={messages} userId={userId} />
        
        {/* 用户列表侧边栏 */}
        <UserList users={users} userId={userId} />
      </div>
      
      {/* 输入区域 */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-3">
        {/* 文件上传区域 */}
        <FileUpload ref={fileUploadRef} onFileSelect={onSendFile} />
        
        {/* 消息输入框 */}
        <form onSubmit={onSendMessage}>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="输入消息..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 h-12"
            />
            <Button 
              type="submit" 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-5 h-5 mr-2" />
              发送
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
