import { useRef, useEffect, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Task, TaskWithSchedule } from '../types'
import { hoursToTimeString } from '../types'
import { ScheduleCard } from './ScheduleCard'

interface TimelineProps {
  tasks: TaskWithSchedule[]
  selectedDate: string // YYYY-MM-DD format
  onEditTask: (task: Task) => void
  onToggleComplete: (taskId: string) => void
  onScheduleUpdate: (taskId: string, start: number, duration: number) => void
  onCreateAtTime?: (hour: number) => void
  onContextMenu: (e: React.MouseEvent, taskId: string) => void
}

// 每小时高度 (px)
const HOUR_HEIGHT = 60

// 时间轴行（每整点一行，包含两个半小时拖放区域）
function TimelineRow({ hour, onCreateAtTime }: { hour: number; onCreateAtTime?: (time: number) => void }) {
  // 整点的 droppable (如 10:00)
  const { setNodeRef: setHourRef } = useDroppable({
    id: `timeline-${hour}`,
  })
  // 半点的 droppable (如 10:30)
  const { setNodeRef: setHalfRef } = useDroppable({
    id: `timeline-${hour + 0.5}`,
  })

  return (
    <div
      className="timeline-row"
      style={{
        height: HOUR_HEIGHT,
        position: 'relative',
      }}
    >
      <div
        className="timeline-label"
        style={{
          color: 'var(--color-gray-400)',
        }}
      >
        {hoursToTimeString(hour)}
      </div>
      {/* 两个半小时的拖放区域（无视觉高亮） */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 整点区域 (上半部分) */}
        <div
          ref={setHourRef}
          style={{ flex: 1, cursor: 'pointer' }}
          onClick={() => onCreateAtTime?.(hour)}
        />
        {/* 半点区域 (下半部分) */}
        <div
          ref={setHalfRef}
          style={{ flex: 1, cursor: 'pointer' }}
          onClick={() => onCreateAtTime?.(hour + 0.5)}
        />
      </div>
    </div>
  )
}

export function Timeline({ tasks, selectedDate, onEditTask, onToggleComplete, onScheduleUpdate, onCreateAtTime, onContextMenu }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // 判断是否为今天
  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 每分钟更新

    return () => clearInterval(timer)
  }, [])

  // 自动滚动标记
  const hasScrolledRef = useRef(false)

  // 滚动到当前时间 (仅首次加载)
  useEffect(() => {
    if (containerRef.current && !hasScrolledRef.current) {
      const currentHour = currentTime.getHours()
      const scrollTop = Math.max(0, (currentHour - 2) * HOUR_HEIGHT)
      containerRef.current.scrollTop = scrollTop
      hasScrolledRef.current = true
    }
  }, [currentTime])

  // 当前时间线位置
  const currentTimeTop = (currentTime.getHours() + currentTime.getMinutes() / 60) * HOUR_HEIGHT

  // 生成24小时 = 24行（只保留整点）
  const hours: number[] = []
  for (let h = 0; h < 24; h++) {
    hours.push(h)
  }

  // 计算任务并排显示的位置（Google Calendar 风格算法）
  // 使用 useMemo 避免重复计算
  const taskPositions = (() => {
    if (tasks.length === 0) return new Map<string, { left: number; width: string }>()

    const baseLeft = 64
    const totalWidth = typeof window !== 'undefined'
      ? window.innerWidth - 340 - 80 - 48
      : 600 // 减去侧边栏和边距

    // 1. 按开始时间排序
    const sortedTasks = [...tasks]
      .filter(t => t.schedule)
      .sort((a, b) => a.schedule!.planned_start - b.schedule!.planned_start)

    if (sortedTasks.length === 0) return new Map<string, { left: number; width: string }>()

    // 2. 为每个任务分配列号
    const columnAssignments = new Map<string, number>()
    const columnEndTimes: number[] = [] // 每列的结束时间

    for (const task of sortedTasks) {
      const start = task.schedule!.planned_start
      const end = start + task.schedule!.planned_duration

      // 找到第一个可用的列（该列的结束时间 <= 当前任务开始时间）
      let assignedColumn = -1
      for (let col = 0; col < columnEndTimes.length; col++) {
        if (columnEndTimes[col] <= start) {
          assignedColumn = col
          break
        }
      }

      // 如果没有可用列，创建新列
      if (assignedColumn === -1) {
        assignedColumn = columnEndTimes.length
        columnEndTimes.push(0)
      }

      // 更新该列的结束时间
      columnEndTimes[assignedColumn] = end
      columnAssignments.set(task.id, assignedColumn)
    }

    // 3. 计算每个任务的最大并发数（决定宽度）
    const getMaxConcurrent = (task: TaskWithSchedule): number => {
      const start = task.schedule!.planned_start
      const end = start + task.schedule!.planned_duration

      let maxConcurrent = 1
      for (const other of sortedTasks) {
        if (other.id === task.id) continue
        const otherStart = other.schedule!.planned_start
        const otherEnd = otherStart + other.schedule!.planned_duration

        // 检查是否有重叠
        if (start < otherEnd && end > otherStart) {
          // 计算在重叠区间内有多少任务
          const overlapStart = Math.max(start, otherStart)
          const overlapEnd = Math.min(end, otherEnd)

          let concurrent = 0
          for (const t of sortedTasks) {
            const tStart = t.schedule!.planned_start
            const tEnd = tStart + t.schedule!.planned_duration
            // 检查该任务是否覆盖重叠区间的任意部分
            if (tStart < overlapEnd && tEnd > overlapStart) {
              concurrent++
            }
          }
          maxConcurrent = Math.max(maxConcurrent, concurrent)
        }
      }
      return maxConcurrent
    }

    // 4. 构建位置映射
    const positions = new Map<string, { left: number; width: string }>()

    for (const task of sortedTasks) {
      const column = columnAssignments.get(task.id) || 0
      const maxConcurrent = getMaxConcurrent(task)

      const cardWidth = totalWidth / maxConcurrent
      const left = baseLeft + column * cardWidth

      positions.set(task.id, {
        left,
        width: `${cardWidth - 8}px`
      })
    }

    return positions
  })()

  const getTaskPosition = (task: TaskWithSchedule) => {
    return taskPositions.get(task.id) || { left: 64, width: 'calc(100% - 80px)' }
  }

  return (
    <div
      ref={containerRef}
      className="custom-scrollbar"
      style={{
        flex: 1,
        margin: '16px 24px 24px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-sm)',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', minHeight: 24 * HOUR_HEIGHT }}>
        {/* 时间行 */}
        {hours.map((hour) => (
          <TimelineRow
            key={hour}
            hour={hour}
            onCreateAtTime={onCreateAtTime}
          />
        ))}

        {/* 当前时间线 - 仅在今天显示 */}
        {isToday && (
          <div
            style={{
              position: 'absolute',
              left: 56,
              right: 0,
              top: currentTimeTop,
              height: 2,
              backgroundColor: 'var(--color-danger)',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
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
          </div>
        )}

        {/* 排班任务卡片 */}
        {tasks.map((task) => (
          <ScheduleCard
            key={task.id}
            task={task}
            position={getTaskPosition(task)}
            selectedDate={selectedDate}
            onEdit={() => onEditTask(task)}
            onToggle={() => onToggleComplete(task.id)}
            onResize={(duration) => {
              if (task.schedule) {
                onScheduleUpdate(task.id, task.schedule.planned_start, duration)
              }
            }}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
    </div>
  )
}
