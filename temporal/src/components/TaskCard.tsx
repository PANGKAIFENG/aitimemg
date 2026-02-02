import { motion } from 'framer-motion'
import type { Task } from '../types'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onClick?: () => void
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const isDone = task.status === 'done'

  return (
    <motion.div
      layout={!isDragging} // 拖拽时禁用 layout 动画，防止跳回效果
      initial={isDragging ? false : { opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={isDragging ? undefined : { scale: 1.02, y: -2 }}
      whileTap={isDragging ? undefined : { scale: 0.98 }}
      transition={isDragging ? { duration: 0 } : undefined}
      className={`task-card group-${task.group} ${isDone ? 'done' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        width: '100%',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onClick={onClick}
    >
      <div style={{ padding: '12px 16px' }}>
        <div
          className="task-title"
          style={{
            fontSize: 14,
            fontWeight: 500,
          }}
          dangerouslySetInnerHTML={{
            __html: task.title.replace(
              /【([^】]+)】/g,
              '<span class="tag-highlight">【$1】</span>'
            ),
          }}
        />
        {task.notes && (
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: 'var(--color-gray-400)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.notes}
          </div>
        )}
      </div>
    </motion.div>
  )
}
