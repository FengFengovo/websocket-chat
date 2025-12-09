import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MessageCircle, Plus, DoorOpen, Loader2 } from 'lucide-react'
import AvatarUpload from './AvatarUpload'

export default function HomePage({ 
  userName, 
  setUserName, 
  roomCode, 
  setRoomCode,
  customRoomCode,
  setCustomRoomCode,
  roomPassword,
  setRoomPassword,
  joinPassword,
  setJoinPassword,
  userAvatar,
  setUserAvatar,
  isCustomAvatar,
  setIsCustomAvatar,
  onCreateRoom, 
  onJoinRoom,
  isConnecting = false
}) {
  return (
    <Card className="w-full max-w-md shadow-2xl mx-2 sm:mx-0">
      <CardHeader className="text-center space-y-2 p-4 sm:p-6">
        <div className="flex justify-center mb-2">
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-600">
          实时聊天室
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          无需登录，创建或加入房间即可开始聊天
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
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
            className="h-10"
          />
        </div>
        
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">创建房间</TabsTrigger>
            <TabsTrigger value="join">加入房间</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); onCreateRoom(); }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">自定义房间号（可选）</label>
                <Input
                  type="text"
                  placeholder="留空则随机生成，支持英文数字"
                  value={customRoomCode}
                  onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  maxLength={12}
                  className="h-10 uppercase"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">房间密码（可选）</label>
                <Input
                  type="password"
                  placeholder="留空则无需密码"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  maxLength={20}
                  className="h-10"
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full h-10 text-base bg-blue-600 hover:bg-blue-700"
                disabled={isConnecting || !userName.trim()}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    连接中...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    创建新房间
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="join" className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); onJoinRoom(); }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">房间号</label>
                <Input
                  type="text"
                  placeholder="输入房间号"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  maxLength={12}
                  className="h-10 uppercase"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">房间密码（如有）</label>
                <Input
                  type="password"
                  placeholder="如果房间有密码请输入"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  maxLength={20}
                  className="h-10"
                />
              </div>
              
              <Button 
                type="submit"
                variant="outline"
                className="w-full h-10 text-base border-2"
                disabled={isConnecting || !userName.trim() || !roomCode.trim()}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    连接中...
                  </>
                ) : (
                  <>
                    <DoorOpen className="w-5 h-5 mr-2" />
                    加入房间
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
