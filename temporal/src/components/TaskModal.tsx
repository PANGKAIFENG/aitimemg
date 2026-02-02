import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DeleteOutlined, CalendarOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Task, TaskGroup, ScheduleEvent } from '../types'
import { TASK_GROUP_CONFIG, hoursToTimeString } from '../types'
import { DateTimePicker } from './DateTimePicker'
import ProjectSelector from './common/ProjectSelector'
import * as taskService from '../services/taskService'
import { extractTagsFromTasks } from '../utils/tagUtils'

interface TaskModalProps {
  open: boolean
  task: Task | null
  schedule?: ScheduleEvent | null  // 当前任务的排班信息
  onClose: () => void
  onSave: (id: string, updates: Partial<Task>) => void
  onCreate: (title: string, group: TaskGroup) => void
  onDelete: (id: string) => void
  onScheduleChange?: (taskId: string, date: string, startTime: number, duration: number) => void
}

export function TaskModal({ open, task, schedule, onClose, onSave, onDelete, onScheduleChange }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [notes, setNotes] = useState(task?.notes || '')
  const [group, setGroup] = useState<TaskGroup>(task?.group || 'neither')
  const [projectId, setProjectId] = useState<string | undefined>(task?.project_id)
  const [executorType, setExecutorType] = useState<'human' | 'ai_auto' | 'ai_copilot'>(task?.executor_type || 'human')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [dateTimePickerOpen, setDateTimePickerOpen] = useState(false)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const notesRef = useRef<HTMLDivElement>(null)

  // 记录鼠标按下时的目标，用于判断点击背景关闭
  const mouseDownTargetRef = useRef<EventTarget | null>(null)

  // 初始化备注内容（只在 modal 打开或 task 变化时设置）
  useEffect(() => {
    if (open && notesRef.current && task) {
      notesRef.current.innerHTML = task.notes || ''
      setNotes(task.notes || '')
    }
  }, [open, task?.id])

  // 异步加载标签
  useEffect(() => {
    if (open) {
      taskService.getTasks().then(tasks => {
        setSuggestedTags(extractTagsFromTasks(tasks))
      })
    }
  }, [open])


  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const handleSave = () => {
    if (!title.trim() || !task) return
    onSave(task.id, {
      title: title.trim(),
      notes: notes.trim() || null,
      group,
      project_id: projectId,
      executor_type: executorType
    })

    // 记住上次选择的分组
    localStorage.setItem('temporal_last_group_preference', group)

    onClose()
  }

  const handleDelete = () => {
    if (task) {
      onDelete(task.id)
      onClose()
    }
  }

  const handleTagClick = (tag: string) => {
    // 聚焦输入框
    // if (!inputRef.current) return // Modal 不需要 ref 也能工作，因为 input 是受控的，且 focus 可以通过 autoFocus 或 ref

    // 计算插入位置：如果有 ref 则在光标处，否则在最后
    // 简化处理：在这个 modal 里我们直接追加或在最后添加，因为原生 input 获取光标位置比较琐碎，
    // 但为了体验最好还是尝试获取光标位置。
    // 这里我们先简单实现追加到末尾，或者更好的：
    // 使用 input 元素的 selectionStart

    // 实际上我们在 input 上没绑定 ref，需要绑一下
    // 见下方 input 修改

    // 复用 CommandBar 逻辑
    const input = document.getElementById('task-modal-title-input') as HTMLInputElement
    if (!input) return

    const cursorPos = input.selectionStart ?? title.length
    const textBefore = title.slice(0, cursorPos)
    const textAfter = title.slice(cursorPos)

    // 检查光标前是否以 # 结尾
    let newTextBefore = textBefore
    if (textBefore.endsWith('#')) {
      newTextBefore = textBefore.slice(0, -1)
    } else if (textBefore.length > 0 && !textBefore.endsWith(' ')) {
      // 如果光标前有文字且不以空格结尾，加一个空格
      newTextBefore = textBefore + ' '
    }

    const tagText = `【${tag}】`
    const newValue = newTextBefore + tagText + textAfter
    setTitle(newValue)

    // 恢复光标位置
    setTimeout(() => {
      input.focus()
      const newCursorPos = newTextBefore.length + tagText.length
      input.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // 高亮预览
  const highlightedTitle = title.replace(
    /【([^】]+)】/g,
    '<span class="tag-highlight">【$1】</span>'
  )

  if (!task) return null

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              // 只有当鼠标按下和抬起都在 backdrop 上时才关闭
              if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
                onClose()
              }
              mouseDownTargetRef.current = null
            }}
            onMouseDown={(e) => {
              mouseDownTargetRef.current = e.target
            }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 480,
                maxHeight: '85vh', // Limit height
                display: 'flex',   // Enable flex layout
                flexDirection: 'column', // Stack children
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
              }}
            >
              {/* Scrollable Content Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  position: 'relative' // For absolute close button
                }}
              >
                <div style={{ padding: '28px 28px 16px', position: 'relative' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-gray-400)',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      zIndex: 10
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
                    <CloseOutlined style={{ fontSize: 18 }} />
                  </button>
                  <input
                    id="task-modal-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="任务标题"
                    autoFocus
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: 24,
                      fontWeight: 600,
                      backgroundColor: 'transparent',
                      color: 'var(--color-gray-800)',
                    }}
                  />

                  {/* 热门建议 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: 'var(--color-gray-400)',
                        flexShrink: 0,
                      }}
                    >
                      热门建议
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      {suggestedTags.length > 0 ? (
                        suggestedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            style={{
                              padding: '4px 12px',
                              border: '1px solid var(--color-gray-200)',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-gray-600)',
                              fontSize: 12,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'
                              e.currentTarget.style.borderColor = 'var(--color-gray-300)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                              e.currentTarget.style.borderColor = 'var(--color-gray-200)'
                            }}
                          >
                            # {tag}
                          </button>
                        ))
                      ) : (
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--color-gray-400)',
                            fontStyle: 'italic',
                          }}
                        >
                          暂无建议
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 高亮预览 */}
                  {title && title.includes('【') && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 15,
                        color: 'var(--color-gray-600)',
                      }}
                      dangerouslySetInnerHTML={{ __html: highlightedTitle }}
                    />
                  )}
                </div>

                {/* 分组选择 */}
                <div style={{ padding: '20px 28px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-gray-400)',
                      marginBottom: 12,
                    }}
                  >
                    分组
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(Object.keys(TASK_GROUP_CONFIG) as TaskGroup[]).map((g) => {
                      const config = TASK_GROUP_CONFIG[g]
                      const isSelected = group === g
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGroup(g)}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isSelected ? config.color : 'var(--color-gray-100)',
                            color: isSelected ? 'white' : 'var(--color-gray-600)',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* [Phase 1.5.1] 项目关联 */}
                <div style={{ padding: '0 28px 20px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-gray-400)',
                      marginBottom: 12,
                    }}
                  >
                    所属项目
                  </div>
                  <ProjectSelector
                    value={projectId}
                    onChange={setProjectId}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* 执行方式选择 (Phase 1.6) */}
                <div style={{ padding: '0 28px 20px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-gray-400)',
                      marginBottom: 12,
                    }}
                  >
                    执行方式
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { type: 'human' as const, label: '纯人工', icon: '👤' },
                      { type: 'ai_copilot' as const, label: 'AI协作', icon: '✨' },
                      { type: 'ai_auto' as const, label: 'AI全自动', icon: '🤖' }
                    ].map((item) => {
                      const isSelected = executorType === item.type
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setExecutorType(item.type)}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isSelected ? '#111827' : 'var(--color-gray-100)',
                            color: isSelected ? 'white' : 'var(--color-gray-600)',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 时间选择 */}
                <div style={{ padding: '0 28px 20px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-gray-400)',
                      marginBottom: 12,
                    }}
                  >
                    时间
                  </div>
                  <button
                    type="button"
                    onClick={() => setDateTimePickerOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-gray-50)',
                      color: schedule ? 'var(--color-gray-700)' : 'var(--color-gray-400)',
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      width: '100%',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'
                    }}
                  >
                    <CalendarOutlined style={{ fontSize: 16 }} />
                    <span>
                      {schedule
                        ? `${dayjs(schedule.date).format('YYYY年M月D日')} ${hoursToTimeString(schedule.planned_start)} - ${hoursToTimeString(schedule.planned_start + schedule.planned_duration)}`
                        : '未安排时间（点击添加）'}
                    </span>
                  </button>
                </div>

                {/* 备注输入 - 富文本支持图片 */}
                <div style={{ padding: '0 28px 20px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-gray-400)',
                      marginBottom: 12,
                    }}
                  >
                    备注 <span style={{ fontSize: 10, opacity: 0.7 }}>（支持粘贴图片）</span>
                  </div>
                  <div
                    ref={notesRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => {
                      const target = e.currentTarget
                      setNotes(target.innerHTML)
                    }}
                    onPaste={(e) => {
                      const items = e.clipboardData.items
                      for (const item of items) {
                        if (item.type.startsWith('image/')) {
                          e.preventDefault()
                          const file = item.getAsFile()
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string
                              // 在光标位置插入图片
                              const selection = window.getSelection()
                              if (selection && selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0)
                                const img = document.createElement('img')
                                img.src = base64
                                img.alt = '粘贴的图片'
                                img.style.maxWidth = '100%'
                                img.style.maxHeight = '200px'
                                img.style.borderRadius = '8px'
                                img.style.marginTop = '8px'
                                img.style.display = 'block'
                                range.insertNode(img)
                                range.setStartAfter(img)
                                range.collapse(true)
                                selection.removeAllRanges()
                                selection.addRange(range)
                                // 更新 notes 状态
                                const container = e.currentTarget
                                setNotes(container.innerHTML)
                              }
                            }
                            reader.readAsDataURL(file)
                          }
                          break
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      padding: '14px 16px',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-gray-50)',
                      color: 'var(--color-gray-700)',
                      fontSize: 14,
                      outline: 'none',
                      fontFamily: 'inherit',
                      lineHeight: 1.6,
                    }}
                    data-placeholder="添加备注..."
                  />
                </div>

              </div>

              {/* 底部操作区 */}
              <div
                style={{
                  padding: '16px 28px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {/* 删除区域 */}
                <div>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'transparent',
                        color: 'var(--color-gray-400)',
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-danger)'
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-gray-400)'
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <DeleteOutlined />
                      <span>不再关注</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--color-danger)' }}>确认删除？</span>
                      <button
                        onClick={handleDelete}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-danger)',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        删除
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-gray-100)',
                          color: 'var(--color-gray-600)',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>

                {/* 保存按钮 - 悬浮胶囊 */}
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: title.trim() ? 'var(--color-primary)' : 'var(--color-gray-200)',
                    color: title.trim() ? 'white' : 'var(--color-gray-400)',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: title.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: title.trim() ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (title.trim()) {
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = title.trim() ? 'var(--shadow-sm)' : 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  保存修改
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 日期时间选择器弹窗 */}
      <DateTimePicker
        open={dateTimePickerOpen}
        currentDate={schedule?.date || null}
        currentStartTime={schedule?.planned_start ?? null}
        currentEndTime={schedule ? schedule.planned_start + schedule.planned_duration : null}
        onSelect={(date, startTime, endTime) => {
          if (task && onScheduleChange) {
            const duration = endTime - startTime
            onScheduleChange(task.id, date, startTime, duration)
          }
          setDateTimePickerOpen(false)
        }}
        onClose={() => setDateTimePickerOpen(false)}
      />
    </>
  )
}
