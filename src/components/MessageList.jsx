import { useRef, useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { FileText, Image as ImageIcon, File, Download } from 'lucide-react'
import ImagePreview from './ImagePreview'

export default function MessageList({ messages, userId }) {
  const messagesEndRef = useRef(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [imageDimensions, setImageDimensions] = useState({})

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // 获取文件图标
  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    if (type?.startsWith('text/')) return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  // 下载文件
  const handleDownload = (file) => {
    const link = document.createElement('a')
    link.href = file.data
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 检查图片尺寸
  const checkImageDimensions = (imageData, index) => {
    if (imageDimensions[index]) return
    
    const img = new Image()
    img.onload = () => {
      setImageDimensions(prev => ({
        ...prev,
        [index]: {
          width: img.width,
          height: img.height,
          isLongImage: img.height > img.width * 2 || img.height > 800
        }
      }))
    }
    img.src = imageData
  }

  // 打开图片预览
  const handleImageClick = (file) => {
    setPreviewImage(file)
  }

  // 关闭图片预览
  const handleClosePreview = () => {
    setPreviewImage(null)
  }

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <ScrollArea className="flex-1 p-3 sm:p-6 bg-gray-50">
      <div className="space-y-3 sm:space-y-4">
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.type === 'system' ? (
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-3 py-1">
                  {msg.message}
                </Badge>
              </div>
            ) : (
              <div className={`flex gap-1.5 sm:gap-2 ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}>
                {msg.userId !== userId && (
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8 mt-5 sm:mt-6 flex-shrink-0">
                    {msg.userAvatar ? (
                      <AvatarImage src={msg.userAvatar} alt={msg.userName} />
                    ) : (
                      <AvatarFallback className="text-sm">
                        {msg.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
                <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${msg.userId === userId ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1 sm:gap-2 px-1">
                    <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                      {msg.userName}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl shadow-sm ${
                      msg.userId === userId
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    {/* 如果有文件，显示文件内容 */}
                    {msg.file && msg.file.data ? (
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 min-w-[200px] sm:min-w-[250px]">
                        {/* 如果是图片，显示图片预览 */}
                        {msg.file.type && msg.file.type.startsWith('image/') ? (
                          <div className="space-y-2">
                            <div className="relative group">
                              <img 
                                src={msg.file.data} 
                                alt={msg.file.name}
                                className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                style={{
                                  maxHeight: imageDimensions[index]?.isLongImage ? '150px' : '300px',
                                  width: imageDimensions[index]?.isLongImage ? '400px' : 'auto',
                                  maxWidth: imageDimensions[index]?.isLongImage ? '400px' : '100%',
                                  objectFit: 'cover'
                                }}
                                onClick={() => handleImageClick(msg.file)}
                                onLoad={() => checkImageDimensions(msg.file.data, index)}
                              />
                              {/* 悬停提示 */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-3 py-1.5 rounded-full">
                                  <p className="text-white text-xs flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    点击查看大图
                                  </p>
                                </div>
                              </div>
                              {/* 长图提示 */}
                              {imageDimensions[index]?.isLongImage && (
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 px-3 py-1 rounded-full">
                                  <p className="text-white text-xs flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    长图
                                  </p>
                                </div>
                              )}
                            </div>
                            {/* 图片文件名（可选显示） */}
                            {msg.file.name && (
                              <p className={`text-xs px-2 truncate ${
                                msg.userId === userId ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {msg.file.name}
                              </p>
                            )}
                          </div>
                        ) : (
                          /* 其他文件类型显示文件信息 */
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-lg ${
                                msg.userId === userId ? 'bg-blue-500' : 'bg-gray-100'
                              }`}>
                                {getFileIcon(msg.file.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  msg.userId === userId ? 'text-white' : 'text-gray-800'
                                }`}>
                                  {msg.file.name}
                                </p>
                                <p className={`text-xs ${
                                  msg.userId === userId ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {formatFileSize(msg.file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(msg.file)}
                              className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                msg.userId === userId 
                                  ? 'bg-blue-500 hover:bg-blue-400 text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                              }`}
                            >
                              <Download className="w-4 h-4" />
                              <span className="text-sm font-medium">下载文件</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : msg.message ? (
                      /* 普通文本消息 */
                      <div className="px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base">
                        {msg.message}
                      </div>
                    ) : null}
                  </div>
                </div>
                {msg.userId === userId && (
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8 mt-5 sm:mt-6 flex-shrink-0">
                    {msg.userAvatar ? (
                      <AvatarImage src={msg.userAvatar} alt={msg.userName} />
                    ) : (
                      <AvatarFallback className="text-sm">
                        {msg.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <ImagePreview
          imageUrl={previewImage.data}
          imageName={previewImage.name}
          onClose={handleClosePreview}
          onDownload={() => handleDownload(previewImage)}
        />
      )}
    </ScrollArea>
  )
}
