import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { PlusOutlined, LeftOutlined, RightOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons'
import type { Task, TaskGroup } from '../types'
import { TASK_GROUP_CONFIG } from '../types'
import ProjectList from './sidebar/ProjectList'

export type ViewMode = 'execute' | 'insights'

interface SidebarProps {
  tasks: Task[]
  collapsed: boolean
  viewMode: ViewMode
  onToggleCollapse: () => void
  onCreateTask: () => void
  onEditTask: (task: Task) => void
  onViewModeChange: (mode: ViewMode) => void
  onContextMenu: (e: React.MouseEvent, taskId: string) => void
}

// 可拖拽的任务项
function DraggableTask({ task, onEdit, onContextMenu }: {
  task: Task;
  onEdit: () => void;
  onContextMenu: (e: React.MouseEvent, taskId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { source: 'sidebar', task },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: 1, // 始终可见（直接拖拽）
    zIndex: isDragging ? 1000 : 1,
    transition: 'none',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task-card group-${task.group} executor-${task.executor_type || 'human'}`}
      onClick={(e) => {
        e.stopPropagation()
        onEdit()
      }}
      onContextMenu={(e) => onContextMenu(e, task.id)}
    >
      <div style={{ padding: '12px 16px' }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: task.status === 'done' ? 'var(--color-gray-400)' : 'var(--color-gray-800)',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          {task.executor_type === 'ai_auto' && <span title="AI全自动">🤖</span>}
          {task.executor_type === 'ai_copilot' && <span className="icon-twinkle" title="AI协作">✨</span>}
          <span
            dangerouslySetInnerHTML={{
              __html: highlightTags(task.title),
            }}
          />
        </div>
      </div>
    </div>
  )
}

// 高亮【】标签
function highlightTags(text: string): string {
  return text.replace(/【([^】]+)】/g, '<span class="tag-highlight">【$1】</span>')
}

// 分组列表
function TaskGroupSection({
  group,
  tasks,
  onEditTask,
  onContextMenu,
}: {
  group: TaskGroup
  tasks: Task[]
  onEditTask: (task: Task) => void
  onContextMenu: (e: React.MouseEvent, taskId: string) => void
}) {
  const config = TASK_GROUP_CONFIG[group]
  const groupTasks = tasks.filter((t) => t.group === group)

  if (groupTasks.length === 0) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          paddingLeft: 4,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: 'var(--color-gray-400)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          {config.icon} {config.label}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groupTasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
    </div>
  )
}

export function Sidebar({
  tasks,
  collapsed,
  viewMode,
  onToggleCollapse,
  onCreateTask,
  onEditTask,
  onViewModeChange,
  onContextMenu,
}: SidebarProps) {
  const navigate = useNavigate()
  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [activeGroupFilter, setActiveGroupFilter] = useState<TaskGroup | null>(null)

  // 过滤后的任务
  const filteredTasks = useMemo(() => {
    let result = tasks

    // 按搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.notes && task.notes.toLowerCase().includes(query))
      )
    }

    // 按分组过滤
    if (activeGroupFilter) {
      result = result.filter(task => task.group === activeGroupFilter)
    }

    return result
  }, [tasks, searchQuery, activeGroupFilter])

  // 侧边栏作为可放置区域（用于取消排班）
  const { setNodeRef, isOver } = useDroppable({
    id: 'sidebar',
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: collapsed ? 0 : 340,
        minWidth: collapsed ? 0 : 340,
        height: '100vh',
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.03)' : 'var(--color-sidebar)',
        borderRight: `1px solid ${isOver ? 'var(--color-primary)' : 'var(--color-gray-100)'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        overflow: 'visible', // 改为 visible 避免裁剪拖拽元素
        position: 'relative',
        zIndex: 1000, // 确保拖拽时在最上层
      }}
    >
      {/* 内容容器 - 收起时隐藏 */}
      <div
        style={{
          width: 340, // 固定宽度，防止收缩挤压
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? 'none' : 'auto', // 收起时不可交互
          transition: 'opacity 0.2s ease',
          visibility: collapsed ? 'hidden' : 'visible', // 确保不可见时也不占位（虽然父级width=0，但visible overflow会漏出来）
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-gray-100)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              className="logo"
              onClick={() => navigate('/home')}
              style={{ cursor: 'pointer' }}
            >Temporal</span>

            {/* 添加按钮 - 参考项目风格：白底阴影 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={onCreateTask}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--color-gray-100)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)'
                  e.currentTarget.style.transform = 'scale(0.95)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                  e.currentTarget.style.borderColor = 'var(--color-gray-100)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <PlusOutlined style={{ fontSize: 14 }} />
              </button>

              {/* 执行/复盘切换 - 参考项目风格 */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'rgba(229, 231, 235, 0.5)',
                  borderRadius: 'var(--radius-md)',
                  padding: 4,
                }}
              >
                <button
                  onClick={() => onViewModeChange('execute')}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: 8,
                    backgroundColor: viewMode === 'execute' ? 'var(--color-surface)' : 'transparent',
                    boxShadow: viewMode === 'execute' ? 'var(--shadow-sm)' : 'none',
                    color: viewMode === 'execute' ? 'var(--color-gray-800)' : 'var(--color-gray-400)',
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  执行
                </button>
                <button
                  onClick={() => onViewModeChange('insights')}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: 8,
                    backgroundColor: viewMode === 'insights' ? 'var(--color-surface)' : 'transparent',
                    boxShadow: viewMode === 'insights' ? 'var(--shadow-sm)' : 'none',
                    color: viewMode === 'insights' ? 'var(--color-gray-800)' : 'var(--color-gray-400)',
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  复盘
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 任务列表 */}
        <div
          style={{
            flex: 1,
            padding: '20px 24px',
            overflowY: 'auto',
          }}
        >
          {/* 搜索框 */}
          <div
            style={{
              position: 'relative',
              marginBottom: 16,
            }}
          >
            <SearchOutlined
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 14,
                color: 'var(--color-gray-400)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索任务..."
              style={{
                width: '100%',
                padding: '10px 36px',
                border: 'none',
                borderRadius: 10,
                backgroundColor: 'var(--color-gray-50)',
                fontSize: 13,
                color: 'var(--color-gray-800)',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-gray-200)',
                  color: 'var(--color-gray-500)',
                  cursor: 'pointer',
                  fontSize: 10,
                }}
              >
                <CloseOutlined />
              </button>
            )}
          </div>

          {/* 分组筛选 */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 20,
            }}
          >
            <button
              onClick={() => setActiveGroupFilter(null)}
              style={{
                padding: '4px 10px',
                border: 'none',
                borderRadius: 16,
                backgroundColor: activeGroupFilter === null ? 'var(--color-primary)' : 'var(--color-gray-100)',
                color: activeGroupFilter === null ? 'white' : 'var(--color-gray-500)',
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              全部
            </button>
            {(['urgent_important', 'important', 'urgent', 'neither'] as TaskGroup[]).map((group) => {
              const config = TASK_GROUP_CONFIG[group]
              const count = tasks.filter(t => t.group === group).length
              if (count === 0) return null
              return (
                <button
                  key={group}
                  onClick={() => setActiveGroupFilter(activeGroupFilter === group ? null : group)}
                  style={{
                    padding: '4px 10px',
                    border: 'none',
                    borderRadius: 16,
                    backgroundColor: activeGroupFilter === group ? config.color : 'var(--color-gray-100)',
                    color: activeGroupFilter === group ? 'white' : 'var(--color-gray-500)',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {config.icon} {count}
                </button>
              )
            })}
          </div>

          {/* 筛选结果提示 */}
          {(searchQuery || activeGroupFilter) && (
            <div
              style={{
                fontSize: 11,
                color: 'var(--color-gray-400)',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                找到 {filteredTasks.length} 个任务
                {activeGroupFilter && ` · ${TASK_GROUP_CONFIG[activeGroupFilter].label}`}
              </span>
              {(searchQuery || activeGroupFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setActiveGroupFilter(null)
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-primary)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  清除筛选
                </button>
              )}
            </div>
          )}

          {activeGroupFilter ? (
            // 筛选模式：只显示筛选结果
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredTasks.map((task) => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onContextMenu={onContextMenu}
                />
              ))}
            </div>
          ) : (
            // 默认模式：按分组显示
            (['urgent_important', 'important', 'urgent', 'neither'] as TaskGroup[]).map((group) => (
              <TaskGroupSection
                key={group}
                group={group}
                tasks={filteredTasks}
                onEditTask={onEditTask}
                onContextMenu={onContextMenu}
              />
            ))
          )}

          {/* Project List Section - Only show when not searching/filtering tasks */}
          {!searchQuery && !activeGroupFilter && (
            <>
              <div style={{ height: 1, backgroundColor: 'var(--color-gray-100)', margin: '16px 0' }} />
              <ProjectList />
            </>
          )}

          {filteredTasks.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--color-gray-400)',
                padding: '40px 0',
                fontSize: 14,
              }}
            >
              {searchQuery || activeGroupFilter ? (
                '没有找到匹配的任务'
              ) : (
                <>
                  暂无任务
                  <br />
                  <span style={{ fontSize: 12 }}>按 ⌘K 快速创建</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={onToggleCollapse}
        style={{
          position: 'absolute',
          left: collapsed ? 0 : 328,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 24,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-surface)',
          border: 'none',
          borderRadius: '0 8px 8px 0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'left 0.3s ease',
          color: 'var(--color-gray-400)',
        }}
      >
        {collapsed ? <RightOutlined style={{ fontSize: 10 }} /> : <LeftOutlined style={{ fontSize: 10 }} />}
      </button>
    </div>
  )
}
