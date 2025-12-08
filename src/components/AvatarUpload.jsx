import { useRef } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Camera, RefreshCw } from 'lucide-react'
import { getRandomDefaultAvatar } from '@/utils/avatarUtils'

export default function AvatarUpload({ userName, userAvatar, onAvatarChange, isCustomAvatar, setIsCustomAvatar }) {
  const fileInputRef = useRef(null)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 检查文件大小（限制为2MB）
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB')
        return
      }
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        onAvatarChange(reader.result)
        setIsCustomAvatar(true) // 标记为自定义头像
      }
      reader.readAsDataURL(file)
    }
  }

  // 切换到随机默认头像
  const handleRandomAvatar = () => {
    const randomAvatar = getRandomDefaultAvatar()
    onAvatarChange(randomAvatar)
    setIsCustomAvatar(false) // 标记为默认头像
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
          <AvatarImage src={userAvatar} alt="头像" />
          <AvatarFallback className="text-2xl">
            {userName ? userName.charAt(0).toUpperCase() : '?'}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={handleAvatarClick}
          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
          title="上传自定义头像"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-500">
          {isCustomAvatar ? '已上传自定义头像' : '使用默认头像'}
        </p>
        <button
          type="button"
          onClick={handleRandomAvatar}
          className="text-blue-600 hover:text-blue-700 transition-colors"
          title="换一个默认头像"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-400">点击相机上传自定义头像（最大2MB）</p>
    </div>
  )
}
