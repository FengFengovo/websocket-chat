import { X, ZoomIn, ZoomOut, Download } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function ImagePreview({ imageUrl, imageName, onClose, onDownload }) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25))
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // 鼠标滚轮缩放
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.max(0.25, Math.min(5, prev + delta)))
  }

  // 鼠标拖动开始
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
      e.preventDefault()
    }
  }

  // 鼠标拖动中
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  // 鼠标拖动结束
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 缩放变化时重置位置
  useEffect(() => {
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 })
    }
  }, [scale])

  // 键盘和鼠标事件监听
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [onClose, isDragging, dragStart, position, scale])

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={handleBackdropClick}
      onWheel={handleWheel}
    >
      {/* 工具栏 */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          title="缩小 (滚轮向下)"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          title="放大 (滚轮向上)"
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
          title="关闭 (ESC)"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 图片名称 */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg z-10">
        <p className="text-white text-sm font-medium">{imageName}</p>
      </div>

      {/* 缩放比例显示 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-lg z-10">
        <p className="text-white text-sm">{Math.round(scale * 100)}%</p>
      </div>

      {/* 图片容器 - 无滚动条，图片居中缩放 */}
      <div className="flex items-center justify-center w-full h-full overflow-hidden">
        <img
          ref={imageRef}
          src={imageUrl}
          alt={imageName}
          onMouseDown={handleMouseDown}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-in-out',
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          className="select-none"
          draggable={false}
        />
      </div>
    </div>
  )
}
