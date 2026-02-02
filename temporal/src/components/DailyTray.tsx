import { useDroppable } from '@dnd-kit/core'
import { useState } from 'react'
import { DownOutlined } from '@ant-design/icons'
import type { Task, TaskWithSchedule } from '../types'
import { DraggableTrayItem } from './DraggableTrayItem'
import { getOverdueDays } from '../services/taskService'

interface DailyTrayProps {
  tasks: TaskWithSchedule[]
  onEditTask: (task: Task) => void
  onToggleComplete: (taskId: string) => void
  onContextMenu: (e: React.MouseEvent, taskId: string) => void
  /** 延期任务列表 */
  overdueTasks?: TaskWithSchedule[]
  /** 当前选中日期 (YYYY-MM-DD) */
  currentDate?: string
  /** 放弃任务回调 */
  onAbandon?: (taskId: string) => void
}

export function DailyTray({
  tasks,
  onEditTask,
  onToggleComplete,
  onContextMenu,
  overdueTasks = [],
  currentDate = new Date().toISOString().split('T')[0],
  onAbandon,
}: DailyTrayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'daily-tray',
  })

  // 默认收起
  const [isExpanded, setIsExpanded] = useState(false)

  const hasOverdue = overdueTasks.length > 0
  const hasTasks = tasks.length > 0
  const totalCount = overdueTasks.length + tasks.length

  return (
    <div style={{ margin: '16px 24px 0' }}>
      {/* 顶部标题栏 - 在虚线框外部 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
            📌 今日任务（拖拽至下方时间轴）
          </span>
          {/* 展开/收起 按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            style={{
              padding: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--color-gray-400)',
              display: 'flex',
              alignItems: 'center',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <DownOutlined style={{ fontSize: 10 }} />
          </button>
        </div>

        <span style={{ fontSize: 12, color: 'var(--color-gray-300)' }}>
          {totalCount} 项待处理
        </span>
      </div>

      {/* 虚线框容器 - 可放置区域 */}
      <div
        ref={setNodeRef}
        style={{
          padding: 16,
          backgroundColor: isOver ? 'rgba(59, 130, 246, 0.08)' : 'var(--color-white)',
          borderRadius: 16,
          border: `2px dashed ${isOver ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
          // 展开时自适应高度（最大500），收起时固定较小高度
          maxHeight: isExpanded ? 500 : 100,
          overflowY: 'auto',
          overflowX: 'hidden',

          transition: 'all 0.3s ease',
          boxShadow: isOver ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
          position: 'relative',
          zIndex: 1000,
        }}
      >
        {/* 内容区域 */}
        <div style={{ opacity: 1, transition: 'opacity 0.2s' }}>
          {/* 延期任务区 */}
          {hasOverdue && (
            <div style={{ marginBottom: hasTasks ? 12 : 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--color-overdue, #F59E0B)',
                    fontWeight: 600,
                  }}
                >
                  ⚠️ 延期任务
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>
                  ({overdueTasks.length} 项)
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  // 如果不仅是延期任务，限制延期任务区域的高度，避免占满
                  maxHeight: isExpanded ? 'none' : 80,
                  // overflowY: 'auto', // 整体滚动，这里取消内部滚动
                  // paddingRight: 4, 
                }}
              >
                {overdueTasks.map((task) => {
                  const overdueDays = task.schedule
                    ? getOverdueDays(task.schedule.date, currentDate)
                    : 0
                  return (
                    <DraggableTrayItem
                      key={task.id}
                      task={task}
                      onEdit={() => onEditTask(task)}
                      onToggle={() => onToggleComplete(task.id)}
                      onContextMenu={onContextMenu}
                      isOverdue={true}
                      overdueDays={overdueDays}
                      onAbandon={onAbandon ? () => onAbandon(task.id) : undefined}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* 分隔线 */}
          {hasOverdue && hasTasks && (
            <div
              style={{
                height: 1,
                backgroundColor: 'var(--color-gray-100)',
                margin: '8px 0',
              }}
            />
          )}

          {/* 今日待排区 */}
          {hasTasks && (
            <div>
              {hasOverdue && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--color-gray-500)',
                      fontWeight: 600,
                    }}
                  >
                    📋 今日待排
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>
                    ({tasks.length} 项)
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tasks.map((task) => (
                  <DraggableTrayItem
                    key={task.id}
                    task={task}
                    onEdit={() => onEditTask(task)}
                    onToggle={() => onToggleComplete(task.id)}
                    onContextMenu={onContextMenu}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {!hasOverdue && !hasTasks && (
            <div
              style={{
                padding: '20px 0',
                textAlign: 'center',
                color: 'var(--color-gray-300)',
                fontSize: 13,
              }}
            >
              将任务拖拽到这里进行今日规划
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

