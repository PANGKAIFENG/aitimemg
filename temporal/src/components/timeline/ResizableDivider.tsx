import { useEffect, useState } from 'react'

interface ResizableDividerProps {
    onResize: (deltaX: number) => void
    className?: string
}

export function ResizableDivider({ onResize, className = '' }: ResizableDividerProps) {
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            onResize(e.movementX)
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            document.body.style.cursor = 'default'
            document.body.style.userSelect = 'auto'
        }

        // 添加全局事件监听
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        // 拖拽时防止选中文本和改变鼠标样式
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'default'
            document.body.style.userSelect = 'auto'
        }
    }, [isDragging, onResize])

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    return (
        <div
            className={`absolute top-0 bottom-0 z-20 flex items-center justify-center w-4 -ml-2 hover:cursor-col-resize group ${className}`}
            style={{ left: '100%' }} // 分割线位置相对于前一个容器
            onMouseDown={handleMouseDown}
        >
            {/* 视觉上的分割线 - 拖拽时或 hover 时高亮 */}
            <div
                className={`w-0.5 h-full transition-colors duration-200 ${isDragging ? 'bg-blue-400' : 'bg-transparent group-hover:bg-blue-200'
                    }`}
            />
        </div>
    )
}
