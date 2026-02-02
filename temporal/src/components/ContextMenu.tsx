import { useEffect, useRef } from 'react'

interface ContextMenuProps {
    x: number
    y: number
    onDuplicate: () => void
    onDelete: () => void
    onClose: () => void
}

export function ContextMenu({ x, y, onDuplicate, onDelete, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    // 点击外部关闭
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        // 使用 mousedown 而不是 click，体验更好
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [onClose])

    // 调整位置，防止超出屏幕 (简单处理)
    const style: React.CSSProperties = {
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 9999,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid var(--color-gray-200)',
        padding: '4px 0',
        minWidth: '160px',
    }

    const itemStyle: React.CSSProperties = {
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        color: 'var(--color-gray-800)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.1s',
    }

    return (
        <div
            ref={menuRef}
            style={style}
            onContextMenu={(e) => e.preventDefault()} // 防止在菜单上右键再次触发原生菜单
        >
            <div
                className="context-menu-item"
                style={itemStyle}
                onClick={() => {
                    onDuplicate()
                    onClose()
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-gray-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
                <span style={{ fontSize: '16px' }}>📄</span> 复制任务
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-gray-100)', margin: '4px 0' }} />

            <div
                className="context-menu-item"
                style={{ ...itemStyle, color: 'var(--color-red-600)' }}
                onClick={() => {
                    onDelete()
                    onClose()
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-red-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
                <span style={{ fontSize: '16px' }}>🗑️</span> 删除任务
            </div>
        </div>
    )
}
