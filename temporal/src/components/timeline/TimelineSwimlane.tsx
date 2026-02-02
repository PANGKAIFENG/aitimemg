import { useEffect, useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Input, Button, Popconfirm } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import type { Task, TaskWithSchedule } from '../../types'
import { hoursToTimeString } from '../../types'
import { ScheduleCard } from '../ScheduleCard'
import ProjectSelector from '../common/ProjectSelector'

interface TimelineSwimlaneProps {
    tasks: TaskWithSchedule[]
    selectedDate: string // YYYY-MM-DD format
    currentTime?: Date // Optional, passed from container for sync
    showLabels?: boolean // Whether to show time labels (e.g. 10:00)
    onEditTask: (task: Task) => void
    onToggleComplete: (taskId: string) => void
    onScheduleUpdate: (taskId: string, start: number, duration: number) => void
    onCreateAtTime?: (hour: number) => void
    onContextMenu: (e: React.MouseEvent, taskId: string) => void

    // Lane Management Props
    laneId?: string
    laneTitle?: string
    projectId?: string
    onUpdateLaneTitle?: (title: string) => void
    onUpdateLaneProject?: (projectId: string | undefined) => void
    onCloseLane?: () => void

    className?: string
    style?: React.CSSProperties
}

// 每小时高度 (px)
const HOUR_HEIGHT = 60

// 时间轴行
function SwimlaneRow({ hour, showLabels, onCreateAtTime }: { hour: number; showLabels: boolean; onCreateAtTime?: (time: number) => void }) {
    const { setNodeRef: setHourRef } = useDroppable({
        id: `timeline-${hour}`,
    })
    const { setNodeRef: setHalfRef } = useDroppable({
        id: `timeline-${hour + 0.5}`,
    })

    return (
        <div
            className="timeline-row border-b border-gray-100 last:border-0"
            style={{
                height: HOUR_HEIGHT,
                position: 'relative',
                display: 'flex',
            }}
        >
            {showLabels && (
                <div
                    className="timeline-label w-16 text-right pr-4 text-xs -mt-2.5 bg-transparent z-10"
                    style={{
                        color: 'var(--color-gray-400)',
                        flexShrink: 0,
                    }}
                >
                    {hoursToTimeString(hour)}
                </div>
            )}

            {/* 拖放区域 */}
            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    ref={setHourRef}
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => onCreateAtTime?.(hour)}
                />
                <div
                    ref={setHalfRef}
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => onCreateAtTime?.(hour + 0.5)}
                />
            </div>
        </div>
    )
}

export function TimelineSwimlane({
    tasks,
    selectedDate,
    currentTime: externalCurrentTime,
    showLabels = false,
    onEditTask,
    onToggleComplete,
    onScheduleUpdate,
    onCreateAtTime,
    onContextMenu,

    // Lane Props
    // laneId, // Not used currently but part of the interface
    laneTitle,
    projectId,
    onUpdateLaneTitle,
    onUpdateLaneProject,
    onCloseLane,

    className,
    style
}: TimelineSwimlaneProps) {
    // Local State for Renaming
    const [isRenaming, setIsRenaming] = useState(false)
    const [editTitle, setEditTitle] = useState(laneTitle || '')
    // Use external time if provided, otherwise local state
    const [localTime, setLocalTime] = useState(new Date())

    const currentTime = externalCurrentTime || localTime

    // Sync editTitle when laneTitle changes
    useEffect(() => {
        setEditTitle(laneTitle || '')
    }, [laneTitle])

    useEffect(() => {
        if (!externalCurrentTime) {
            const timer = setInterval(() => setLocalTime(new Date()), 60000)
            return () => clearInterval(timer)
        }
    }, [externalCurrentTime])

    const handleTitleSave = () => {
        if (editTitle.trim() && onUpdateLaneTitle) {
            onUpdateLaneTitle(editTitle.trim())
        }
        setIsRenaming(false)
    }

    // 判断是否为今天
    const today = new Date().toISOString().split('T')[0]
    const isToday = selectedDate === today

    // 当前时间线位置
    const currentTimeTop = (currentTime.getHours() + currentTime.getMinutes() / 60) * HOUR_HEIGHT

    // 生成24小时
    const hours = Array.from({ length: 24 }, (_, i) => i)

    // 计算任务位置 (Google Calendar Algorithm)
    const taskPositions = useMemo(() => {
        if (tasks.length === 0) return new Map<string, { left: string; width: string }>()

        // Left offset: if labels are shown, push right
        const basePadding = showLabels ? 64 : 8

        const sortedTasks = [...tasks]
            .filter(t => t.schedule)
            .sort((a, b) => a.schedule!.planned_start - b.schedule!.planned_start)

        if (sortedTasks.length === 0) return new Map()

        const columnAssignments = new Map<string, number>()
        const columnEndTimes: number[] = []

        for (const task of sortedTasks) {
            const start = task.schedule!.planned_start
            const end = start + task.schedule!.planned_duration
            let assignedColumn = -1
            for (let col = 0; col < columnEndTimes.length; col++) {
                if (columnEndTimes[col] <= start) {
                    assignedColumn = col
                    break
                }
            }
            if (assignedColumn === -1) {
                assignedColumn = columnEndTimes.length
                columnEndTimes.push(0)
            }
            columnEndTimes[assignedColumn] = end
            columnAssignments.set(task.id, assignedColumn)
        }

        const positions = new Map<string, { left: string; width: string }>()

        for (const task of sortedTasks) {
            const col = columnAssignments.get(task.id) || 0

            // Analyze concurrent tasks for simplified overlap logic
            let maxConcurrent = 1
            const start = task.schedule!.planned_start
            const end = start + task.schedule!.planned_duration
            for (const other of sortedTasks) {
                if (other.id === task.id) continue
                const otherStart = other.schedule!.planned_start
                const otherEnd = otherStart + other.schedule!.planned_duration
                if (start < otherEnd && end > otherStart) {
                    let currentConcurrent = 0
                    const overlapStart = Math.max(start, otherStart)
                    const overlapEnd = Math.min(end, otherEnd)
                    for (const t of sortedTasks) {
                        const tStart = t.schedule!.planned_start
                        const tEnd = tStart + t.schedule!.planned_duration
                        if (tStart < overlapEnd && tEnd > overlapStart) currentConcurrent++
                    }
                    maxConcurrent = Math.max(maxConcurrent, currentConcurrent)
                }
            }

            const widthPercent = 100 / maxConcurrent
            const leftPercent = col * widthPercent

            positions.set(task.id, {
                left: showLabels ? `calc(${basePadding}px + ${leftPercent}% - ${(basePadding * leftPercent) / 100}px)` : `${leftPercent}%`,
                width: showLabels ? `calc(${widthPercent}% - 64px/${maxConcurrent} - 8px)` : `calc(${widthPercent}% - 8px)`
            })
        }

        return positions
    }, [tasks, showLabels])

    // Header Component inside Swimlane for sticky behavior
    const SwimlaneHeader = () => {
        if (!laneTitle && !onCloseLane) return null // Hide if no header props provided (Focus View compatibility)

        return (
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b  border-gray-200 px-3 py-2 flex items-center justify-between shadow-sm" style={{ height: 48 }}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <ProjectSelector
                            value={projectId}
                            onChange={onUpdateLaneProject}
                            allowClear
                            style={{ width: 24, padding: 0, border: 'none' }} // Minimalist UI
                            placeholder="" // Just the dot
                        />
                    </div>
                    {isRenaming ? (
                        <Input
                            value={editTitle}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)} // Explicit type
                            onBlur={handleTitleSave}
                            onPressEnter={handleTitleSave}
                            autoFocus
                            size="small"
                        />
                    ) : (
                        <div
                            className="font-medium truncate cursor-text hover:bg-gray-100 px-1 rounded transition-colors"
                            onDoubleClick={() => setIsRenaming(true)}
                            title="Double click to rename"
                        >
                            {laneTitle || 'Untitled Lane'}
                        </div>
                    )}
                </div>

                {onCloseLane && (
                    <Popconfirm
                        title="Close this lane?"
                        description="Tasks will be preserved in their project."
                        onConfirm={onCloseLane}
                        okText="Close"
                        cancelText="Cancel"
                    >
                        <Button type="text" size="small" icon={<CloseOutlined />} className="text-gray-400 hover:text-red-500" />
                    </Popconfirm>
                )}
            </div>
        )
    }

    return (
        <div
            className={`relative min-h-full flex flex-col ${className}`}
            style={{
                backgroundColor: 'var(--color-surface)',
                ...style
            }}
        >
            <SwimlaneHeader />

            <div className="flex-1 relative">
                {/* Grid Rows */}
                {hours.map((hour) => (
                    <SwimlaneRow
                        key={hour}
                        hour={hour}
                        showLabels={showLabels}
                        onCreateAtTime={onCreateAtTime}
                    />
                ))}

                {/* Current Time Line */}
                {isToday && (
                    <div
                        style={{
                            position: 'absolute',
                            left: showLabels ? 56 : 0,
                            right: 0,
                            top: currentTimeTop,
                            height: 2,
                            backgroundColor: 'var(--color-danger)',
                            zIndex: 50,
                            pointerEvents: 'none',
                        }}
                    >
                        {showLabels && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: -4,
                                    top: -3,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-danger)',
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Tasks */}
                {tasks.filter(t => t.schedule).map((task) => {
                    const pos = taskPositions.get(task.id) || { left: showLabels ? '64px' : '0', width: '90%' }
                    return (
                        <ScheduleCard
                            key={task.id}
                            task={task}
                            position={{ left: pos.left, width: pos.width }}
                            selectedDate={selectedDate}
                            onEdit={() => onEditTask(task)}
                            onToggle={() => onToggleComplete(task.id)}
                            onResize={(d) => task.schedule && onScheduleUpdate(task.id, task.schedule.planned_start, d)}
                            onContextMenu={onContextMenu}
                        />
                    )
                })}
            </div>
        </div>
    )
}
