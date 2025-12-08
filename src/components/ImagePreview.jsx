import { X, ZoomIn, ZoomOut, Download } from 'lucide-react'
import { useState } from 'react'

export default function ImagePreview({ imageUrl, imageName, onClose, onDownload }) {
  const [scale, setScale] = useState(1)

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* 工具栏 */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          title="缩小"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          title="放大"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onDownload}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          title="下载"
        >
          <Download className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          title="关闭"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 图片名称 */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        <p className="text-white text-sm font-medium">{imageName}</p>
      </div>

      {/* 缩放比例显示 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        <p className="text-white text-sm">{Math.round(scale * 100)}%</p>
      </div>

      {/* 图片容器 */}
      <div className="max-w-full max-h-full overflow-auto">
        <img
          src={imageUrl}
          alt={imageName}
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 0.2s ease-in-out',
            transformOrigin: 'center center'
          }}
          className="max-w-none"
        />
      </div>
    </div>
  )
}
