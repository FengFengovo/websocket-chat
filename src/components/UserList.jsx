import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Users } from 'lucide-react'

export default function UserList({ users, userId }) {
  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">在线用户</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Avatar className="w-10 h-10 border-2 border-gray-300">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{user.name}</p>
              </div>
              {user.id === userId && (
                <Badge className="bg-blue-600 text-white">我</Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
