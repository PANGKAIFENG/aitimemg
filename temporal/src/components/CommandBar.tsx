import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThunderboltOutlined, CloseOutlined } from '@ant-design/icons'
import type { TaskGroup } from '../types'
import * as taskService from '../services/taskService'

interface CommandBarProps {
  open: boolean
  onClose: () => void
  onCreate: (title: string, group: TaskGroup) => void
}

import { extractTagsFromTasks } from '../utils/tagUtils'

const DRAFT_KEY = 'temporal_commandbar_draft'

export function CommandBar({ open, onClose, onCreate }: CommandBarProps) {
  const [value, setValue] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // 记录鼠标按下时的目标，用于判断点击背景关闭
  const mouseDownTargetRef = useRef<EventTarget | null>(null)

  // 异步加载标签
  useEffect(() => {
    if (open) {
      taskService.getTasks().then(tasks => {
        setSuggestedTags(extractTagsFromTasks(tasks))
      })
    }
  }, [open])

  useEffect(() => {
    if (open) {
      // 延迟执行以避免同步 setState 导致的 lint 错误
      const timer = setTimeout(() => {
        // 恢复草稿（如果有）
        const draft = localStorage.getItem(DRAFT_KEY)
        setValue(draft || '')
        inputRef.current?.focus()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open])

  // 输入时自动保存草稿
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    // 保存草稿到 localStorage
    if (newValue.trim()) {
      localStorage.setItem(DRAFT_KEY, newValue)
    } else {
      localStorage.removeItem(DRAFT_KEY)
    }
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      // 根据标题推断分组（艾森豪威尔四象限）
      let group: TaskGroup | null = null
      const lowerValue = value.toLowerCase()

      if (lowerValue.includes('紧急') && lowerValue.includes('重要')) {
        group = 'urgent_important'
      } else if (lowerValue.includes('重要') || lowerValue.includes('核心') || lowerValue.includes('关键')) {
        group = 'important'
      } else if (lowerValue.includes('紧急') || lowerValue.includes('快速') || lowerValue.includes('处理')) {
        group = 'urgent'
      }

      // 如果没有匹配到关键词，使用记忆或默认值
      if (!group) {
        const saved = localStorage.getItem('temporal_last_group_preference') as TaskGroup
        group = saved || 'urgent_important'
      }

      onCreate(value.trim(), group)
      // 清除草稿
      localStorage.removeItem(DRAFT_KEY)
      setValue('')
      onClose()
    }
  }

  const handleTagClick = (tag: string) => {
    const input = inputRef.current
    if (!input) return

    const cursorPos = input.selectionStart ?? value.length
    const textBefore = value.slice(0, cursorPos)
    const textAfter = value.slice(cursorPos)

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
    setValue(newValue)

    // 设置光标位置到标签后面
    setTimeout(() => {
      const newCursorPos = newTextBefore.length + tagText.length
      input.focus()
      input.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
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
            justifyContent: 'center',
            paddingTop: '18vh',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 1000,
          }}
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 560,
              height: 'fit-content',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
          >
            {/* 输入区域 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px 24px',
              }}
            >
              {/* 闪电图标 */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <ThunderboltOutlined style={{ fontSize: 22 }} />
              </div>

              {/* 无边框输入 */}
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                placeholder="快速捕捉灵感或任务..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 18,
                  fontWeight: 500,
                  backgroundColor: 'transparent',
                  color: 'var(--color-gray-800)',
                }}
              />

              <button
                type="button"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-gray-400)',
                  cursor: 'pointer',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  transition: 'all 0.15s',
                  marginLeft: 8,
                  marginRight: -10
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
            </div>

            {/* 标签建议区 */}
            <div
              style={{
                padding: '16px 24px 20px',
                borderTop: '1px solid var(--color-gray-100)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
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
                          padding: '6px 14px',
                          border: '1px solid var(--color-gray-200)',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-gray-600)',
                          fontSize: 13,
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
                        fontSize: 13,
                        color: 'var(--color-gray-400)',
                        fontStyle: 'italic',
                      }}
                    >
                      暂无建议，将根据你创建的标签更新
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
