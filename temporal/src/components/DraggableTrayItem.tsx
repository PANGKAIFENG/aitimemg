import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { TaskWithSchedule } from '../types'
import { TASK_GROUP_CONFIG } from '../types'

interface DraggableTrayItemProps {
    task: TaskWithSchedule
    onEdit: () => void
    onToggle: () => void
    onContextMenu: (e: React.MouseEvent, taskId: string) => void
    /** 是否为延期任务 */
    isOverdue?: boolean
    /** 延期天数 */
    overdueDays?: number
    /** 放弃任务回调（仅延期任务显示） */
    onAbandon?: () => void
}

// 可拖拽的待排班任务项
export function DraggableTrayItem({
    task,
    onEdit,
    onToggle,
    onContextMenu,
    isOverdue = false,
    overdueDays = 0,
    onAbandon,
}: DraggableTrayItemProps) {
    const config = TASK_GROUP_CONFIG[task.group]
    const isDone = task.status === 'done'

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { source: isOverdue ? 'overdue' : 'daily-tray', task }, // Add task data for overlay
    })

    const style = {
        transform: isDragging ? undefined : CSS.Transform.toString(transform), // 拖拽时不移动原位置
        opacity: isDragging ? 0 : 1, // 拖拽时完全隐藏原元素，由 DragOverlay 显示
        zIndex: isDragging ? 1000 : 1,
        transition: 'none',
    }

    // 延期任务使用橙色主题
    const borderColor = isOverdue ? 'var(--color-overdue, #F59E0B)' : config.color
    const backgroundColor = isOverdue
        ? 'var(--color-overdue-bg, rgba(245, 158, 11, 0.08))'
        : isDone
            ? 'var(--color-gray-50)'
            : 'var(--color-surface)'

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor,
                borderLeft: isOverdue ? `4px solid var(--color-overdue, #F59E0B)` : 'none',
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: isDragging ? 'none' : 'background-color 0.2s, box-shadow 0.2s',
                boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
            }}
            {...listeners}
            {...attributes}
            onContextMenu={(e) => onContextMenu(e, task.id)}
        >
            <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}
                onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                }}
            >
                {/* 左侧颜色条（非延期任务才显示） */}
                {!isOverdue && (
                    <div
                        style={{
                            width: 4,
                            height: 16,
                            borderRadius: 9999,
                            backgroundColor: borderColor,
                            opacity: 0.6,
                        }}
                    />
                )}
                {/* 延期天数徽章 */}
                {isOverdue && overdueDays > 0 && (
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 12,
                            backgroundColor: 'var(--color-overdue, #F59E0B)',
                            color: 'white',
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        ⚠️ 延期 {overdueDays} 天
                    </span>
                )}
                <span
                    style={{
                        fontSize: 14,
                        color: isDone ? 'var(--color-gray-400)' : 'var(--color-gray-700)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    }}
                >
                    {task.executor_type === 'ai_auto' && <span title="AI全自动">🤖</span>}
                    {task.executor_type === 'ai_copilot' && <span className="icon-twinkle" title="AI协作">✨</span>}
                    <span
                        dangerouslySetInnerHTML={{
                            __html: task.title.replace(
                                /【([^】]+)】/g,
                                '<span class="tag-highlight">【$1】</span>'
                            ),
                        }}
                    />
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* 状态标签（非延期任务显示） */}
                {!isOverdue && (
                    <span style={{ fontSize: 11, color: 'var(--color-gray-400)', fontWeight: 500 }}>
                        {isDone ? '已完成' : '待排'}
                    </span>
                )}
                {/* 放弃按钮（仅延期任务显示） */}
                {isOverdue && onAbandon && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onAbandon()
                        }}
                        title="放弃此任务"
                        style={{
                            width: 20,
                            height: 20,
                            border: 'none',
                            borderRadius: 4,
                            backgroundColor: 'transparent',
                            color: 'var(--color-gray-400)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
                            e.currentTarget.style.color = 'var(--color-gray-600)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = 'var(--color-gray-400)'
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M3 3L9 9M9 3L3 9"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                )}
                {/* 完成复选框 */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggle()
                    }}
                    style={{
                        width: 18,
                        height: 18,
                        border: `2px solid ${isDone ? 'var(--color-success)' : isOverdue ? 'var(--color-overdue, #F59E0B)' : 'var(--color-gray-300)'}`,
                        borderRadius: 6,
                        backgroundColor: isDone ? 'var(--color-success)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                    }}
                >
                    {isDone && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                                d="M2 5L4 7L8 3"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    )
}

