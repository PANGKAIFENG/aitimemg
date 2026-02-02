import { useState, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { TaskWithSchedule } from '../types'
import { hoursToTimeString } from '../types'

const HOUR_HEIGHT = 60

// 格式化超时时间（小时为主）
function formatOverdueTime(hours: number): string {
    if (hours < 1) {
        return `${Math.round(hours * 60)}m`
    }
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) {
        return `${h}h`
    }
    return `${h}h${m}m`
}

interface ScheduleCardProps {
    task: TaskWithSchedule
    onEdit: () => void
    onToggle: () => void
    onResize: (duration: number) => void
    position: { left: number | string; width: string }
    selectedDate: string
    onContextMenu: (e: React.MouseEvent, taskId: string) => void
}

// 可拖拽的排班任务卡片
export function ScheduleCard({
    task,
    onEdit,
    onToggle,
    onResize,
    position,
    selectedDate,
    onContextMenu,
}: ScheduleCardProps) {
    const schedule = task.schedule!
    const isDone = task.status === 'done'


    // 拖拽支持
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: {
            source: 'timeline',
            originalDate: selectedDate,
            originalStart: task.schedule?.planned_start,
            originalDuration: task.schedule?.planned_duration,
            task // Add task data for overlay
        },
    })

    // 计算位置和高度
    const top = schedule.planned_start * HOUR_HEIGHT
    const height = schedule.planned_duration * HOUR_HEIGHT

    // 检查是否超时（考虑日期）
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const isToday = selectedDate === today
    const isPastDate = selectedDate < today

    // 计算当前小时：今天用当前时间，过去的日期用 24:00
    const currentHour = isToday ? (now.getHours() + now.getMinutes() / 60) : (isPastDate ? 24 : 0)
    const plannedEnd = schedule.planned_start + schedule.planned_duration
    // 过期判断：未完成 && (今天超过结束时间 || 过去的日期)
    const isOverdue = !isDone && (isPastDate || (isToday && currentHour > plannedEnd))

    // 拖拽调整高度
    const [isResizing, setIsResizing] = useState(false)
    const [resizeStartY, setResizeStartY] = useState(0)
    const [initialHeight, setInitialHeight] = useState(height)

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setIsResizing(true)
        setResizeStartY(e.clientY)
        setInitialHeight(height)
    }

    useEffect(() => {
        if (!isResizing) return

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - resizeStartY
            const newHeight = Math.max(HOUR_HEIGHT / 2, initialHeight + deltaY) // 最小 30 分钟
            const newDuration = Math.round((newHeight / HOUR_HEIGHT) * 2) / 2 // 吸附到 30 分钟
            onResize(Math.max(0.5, newDuration))
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing, resizeStartY, initialHeight, onResize])

    const dragStyle = {
        transform: CSS.Translate.toString(transform),
    }

    return (
        <div
            ref={setNodeRef}
            onContextMenu={(e) => onContextMenu(e, task.id)}
            style={{
                ...dragStyle,
                position: 'absolute',
                left: position.left,
                width: position.width,
                top,
                height: height - 4, // 留出 4px 间隙
                zIndex: isDragging ? 1000 : 10, // 拖拽时提升层级
                opacity: 1, // 保持不透明，用 visibility 控制隐藏
                visibility: isDragging ? 'hidden' : 'visible', // 拖拽时完全隐藏，避免滚动时闪烁
                pointerEvents: isDragging ? 'none' : 'auto',
                transition: 'none', // 禁用所有过渡动画
            }}
        >
            <div
                className={`task-card group-${task.group} executor-${task.executor_type || 'human'} ${isDone ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    // borderLeft: removed, handled by CSS class
                    boxShadow: isDragging ? 'var(--shadow-lg)' : undefined, // Allow CSS to handle default shadow
                    // transition: isDragging ? 'none' : 'box-shadow 0.2s', // Handled by CSS
                }}
                {...listeners}
                {...attributes}
            >
                {/* 已完成斜纹背景 */}
                {isDone && (
                    <div
                        className="pattern-stripes"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.3,
                            borderRadius: 12,
                        }}
                    />
                )}

                <div
                    onClick={(e) => {
                        e.stopPropagation()
                        onEdit()
                    }}
                    style={{
                        padding: height < 40 ? '2px 8px' : '6px 10px', // More breathing room, less vertical padding for very short tasks
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'stretch',
                        position: 'relative',
                        zIndex: 1,
                        gap: height < 40 ? 4 : 4,
                        cursor: 'pointer',
                    }}
                >
                    {/* 短任务：复选框 → 时间 → 标题 */}
                    {height < 60 ? (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                flex: 1,
                            }}
                        >
                            {/* 复选框 - 统一尺寸 */}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onToggle()
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center', // Center vertically for short tasks
                                    justifyContent: 'center',
                                    width: 24, // Standardized width
                                    height: '100%',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <div
                                    style={{
                                        width: 16, // Standardized size
                                        height: 16,
                                        border: `1.5px solid ${isDone ? 'var(--color-success)' : 'var(--color-gray-400)'}`, // Lighter border for unchecked
                                        borderRadius: 5, // Softer radius
                                        backgroundColor: isDone ? 'var(--color-success)' : 'rgba(255,255,255,0.5)', // Translucent fill
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {isDone && (
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {/* 时间 */}
                            <span
                                style={{
                                    fontSize: 11,
                                    color: 'var(--color-gray-400)',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                    flexShrink: 0,
                                }}
                            >
                                {hoursToTimeString(schedule.planned_start)}-{hoursToTimeString(plannedEnd)}
                            </span>
                            {/* 标题 */}
                            <div
                                className="task-title"
                                style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {task.executor_type === 'ai_auto' && <span title="AI全自动" style={{ flexShrink: 0 }}>🤖</span>}
                                {task.executor_type === 'ai_copilot' && <span className="icon-twinkle" title="AI协作" style={{ flexShrink: 0 }}>✨</span>}
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: task.title.replace(
                                            /【([^】]+)】/g,
                                            '<span class="tag-highlight">【$1】</span>'
                                        ),
                                    }}
                                    className="truncate"
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                />
                                {isOverdue && (
                                    <span style={{ fontSize: 10, color: '#E57373', fontWeight: 500, flexShrink: 0 }}>
                                        延期{formatOverdueTime(currentHour - plannedEnd)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* 长任务：复选框在左，时间 + 标题在右 */
                        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                            {/* 复选框 - 统一尺寸 */}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onToggle()
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start', // Align top for long tasks
                                    justifyContent: 'center',
                                    width: 24, // Standardized width
                                    paddingTop: 2, // Slight offset to align with first line of text
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <div
                                    style={{
                                        width: 16, // Standardized size
                                        height: 16,
                                        border: `1.5px solid ${isDone ? 'var(--color-success)' : 'var(--color-gray-400)'}`,
                                        borderRadius: 5,
                                        backgroundColor: isDone ? 'var(--color-success)' : 'rgba(255,255,255,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {isDone && (
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {/* 内容区 */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {/* 时间 */}
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--color-gray-400)',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 600,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {hoursToTimeString(schedule.planned_start)} - {hoursToTimeString(plannedEnd)}
                                </span>
                                {/* 标题 */}
                                <div
                                    className="task-title"
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        flex: 1,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        flexWrap: 'wrap',
                                        gap: 6,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {task.executor_type === 'ai_auto' && <span title="AI全自动" style={{ marginRight: 4, flexShrink: 0, height: 20 }}>🤖</span>}
                                    {task.executor_type === 'ai_copilot' && <span className="icon-twinkle" title="AI协作" style={{ marginRight: 4, flexShrink: 0, height: 20 }}>✨</span>}
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: task.title.replace(
                                                /【([^】]+)】/g,
                                                '<span class="tag-highlight">【$1】</span>'
                                            ),
                                        }}
                                        style={{
                                            wordBreak: 'break-all',
                                        }}
                                    />
                                    {isOverdue && (
                                        <span style={{ fontSize: 10, color: '#E57373', fontWeight: 500, whiteSpace: 'nowrap', marginTop: 1 }}>
                                            延期{formatOverdueTime(currentHour - plannedEnd)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 拖拽调整高度的手柄 - 放在 task-card 外层 */}
            {/* 拖拽调整高度的手柄 - 放在 task-card 外层 (隐形但可交互) */}
            <div
                onMouseDown={handleResizeStart}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 12, // 保持一定高度以便鼠标捕获
                    cursor: 'ns-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0 0 12px 12px',
                    transition: 'none',
                    backgroundColor: 'transparent',
                    zIndex: 20,
                }}
            />
        </div>
    )
}
