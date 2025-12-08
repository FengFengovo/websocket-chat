import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MessageCircle, Plus, DoorOpen } from 'lucide-react'
import AvatarUpload from './AvatarUpload'

export default function HomePage({ 
  userName, 
  setUserName, 
  roomCode, 
  setRoomCode,
  userAvatar,
  setUserAvatar,
  isCustomAvatar,
  setIsCustomAvatar,
  onCreateRoom, 
  onJoinRoom 
}) {
  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="bg-blue-600 p-3 rounded-full">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-blue-600">
          实时聊天室
        </CardTitle>
        <CardDescription className="text-base">
          无需登录，创建或加入房间即可开始聊天
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 头像选择 */}
        <AvatarUpload 
          userName={userName}
          userAvatar={userAvatar}
          onAvatarChange={setUserAvatar}
          isCustomAvatar={isCustomAvatar}
          setIsCustomAvatar={setIsCustomAvatar}
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">你的昵称</label>
          <Input
            type="text"
            placeholder="输入你的昵称"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            maxLength={20}
            className="h-12"
          />
        </div>
        
        <Button 
          className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
          onClick={onCreateRoom}
        >
          <Plus className="w-5 h-5 mr-2" />
          创建新房间
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">或</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">房间码</label>
          <Input
            type="text"
            placeholder="输入房间码"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="h-12 uppercase"
          />
        </div>
        
        <Button 
          variant="outline"
          className="w-full h-12 text-base border-2"
          onClick={onJoinRoom}
        >
          <DoorOpen className="w-5 h-5 mr-2" />
          加入房间
        </Button>
      </CardContent>
    </Card>
  )
}
