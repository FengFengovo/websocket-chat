import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, X, FileText, Image as ImageIcon, File } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { showAlert } from '@/stores/alertStore'

const FileUpload = forwardRef(({ onFileSelect, disabled }, ref) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [currentFileId, setCurrentFileId] = useState(null)
  const fileInputRef = useRef(null)

  // 暴露完成上传的方法给父组件
  useImperativeHandle(ref, () => ({
    completeUpload: (fileId) => {
      if (currentFileId === fileId) {
        setUploadProgress(100)
        setTimeout(() => {
          setSelectedFile(null)
          setPreview(null)
          setUploadProgress(0)
          setIsUploading(false)
          setCurrentFileId(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }, 800)
      }
    }
  }))

  // 处理文件选择
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 检查文件大小（限制为1GB）
      if (file.size > 1024 * 1024 * 1024) {
        showAlert("错误", "文件大小不能超过1GB", "destructive")
        return
      }

      setSelectedFile(file)

      // 如果是图片，生成预览
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }

  // 发送文件（分块上传）
  const handleSendFile = async () => {
    if (selectedFile && !isUploading) {
      setIsUploading(true)
      setUploadProgress(0)
      
      try {
        // 小文件（<10MB）直接发送
        if (selectedFile.size < 10 * 1024 * 1024) {
          const reader = new FileReader()
          
          reader.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 90)
              setUploadProgress(progress)
            }
          }
          
          reader.onloadend = () => {
            setUploadProgress(90)
            
            const fileId = Date.now() + '_' + Math.random().toString(36).substring(7)
            setCurrentFileId(fileId)
            
            onFileSelect({
              fileId,
              name: selectedFile.name,
              type: selectedFile.type,
              size: selectedFile.size,
              data: reader.result
            })
            
            // 小文件发送后等待服务器确认，不立即显示100%
            setUploadProgress(95)
          }
          
          reader.onerror = () => {
            showAlert("错误", "文件读取失败，请重试", "destructive")
            setIsUploading(false)
            setUploadProgress(0)
          }
          
          reader.readAsDataURL(selectedFile)
        } else {
          // 大文件分块上传
          const chunkSize = 512 * 1024 // 512KB per chunk
          const totalChunks = Math.ceil(selectedFile.size / chunkSize)
          const fileId = Date.now() + '_' + Math.random().toString(36).substring(7)
          
          // 读取整个文件
          const reader = new FileReader()
          reader.readAsDataURL(selectedFile)
          
          reader.onloadend = async () => {
            const base64Data = reader.result
            
            setCurrentFileId(fileId)
            
            // 分块发送
            for (let i = 0; i < totalChunks; i++) {
              const start = i * chunkSize
              const end = Math.min(start + chunkSize, base64Data.length)
              const chunk = base64Data.substring(start, end)
              
              // 发送块
              onFileSelect({
                isChunk: true,
                fileId,
                chunkIndex: i,
                totalChunks,
                chunk,
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                fileSize: selectedFile.size
              })
              
              // 更新进度（最多到95%）
              const progress = Math.round(((i + 1) / totalChunks) * 95)
              setUploadProgress(progress)
              
              // 等待一小段时间，避免消息过快
              await new Promise(resolve => setTimeout(resolve, 50))
            }
            
            // 所有块发送完成，等待服务器处理
            setUploadProgress(95)
          }
          
          reader.onerror = () => {
            showAlert("错误", "文件读取失败，请重试", "destructive")
            setIsUploading(false)
            setUploadProgress(0)
          }
        }
      } catch (error) {
        console.error('文件上传失败:', error)
        showAlert("错误", "文件上传失败，请重试", "destructive")
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }

  // 取消选择
  const handleCancel = () => {
    if (isUploading) {
      if (!confirm('文件正在上传中，确定要取消吗？')) {
        return
      }
    }
    setSelectedFile(null)
    setPreview(null)
    setUploadProgress(0)
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  // 获取文件图标
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    if (type.startsWith('text/')) return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  return (
    <div className="space-y-2">
      {/* 文件选择按钮 */}
      {!selectedFile && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="text-gray-600 hover:text-blue-600"
          >
            <Paperclip className="w-4 h-4 mr-2" />
            上传文件
          </Button>
        </div>
      )}

      {/* 文件预览 */}
      {selectedFile && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            {/* 预览区域 */}
            <div className="flex-shrink-0">
              {preview ? (
                <img 
                  src={preview} 
                  alt="预览" 
                  className="w-16 h-16 object-cover rounded border border-gray-300"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  {getFileIcon(selectedFile.type)}
                </div>
              )}
            </div>

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
              
              {/* 上传进度条 */}
              {isUploading && (
                <div className="mt-2 space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-blue-600">
                    {uploadProgress < 90 ? '发送中...' : 
                     uploadProgress < 100 ? '等待服务器处理...' : 
                     '发送完成！'} {uploadProgress}%
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSendFile}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? '上传中...' : '发送文件'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  取消
                </Button>
              </div>
            </div>

            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

FileUpload.displayName = 'FileUpload'

export default FileUpload
