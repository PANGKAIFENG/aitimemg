import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import { motion } from 'framer-motion'
import * as taskService from '../services/taskService'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

interface InsightsViewProps {
  selectedDate: string
}

interface DayStats {
  date: string
  dayLabel: string
  total: number
  completed: number
  totalHours: number
}

export function InsightsView({ selectedDate }: InsightsViewProps) {
  const [weekStats, setWeekStats] = useState<DayStats[]>([])
  const [overallStats, setOverallStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalHours: 0,
    completionRate: 0,
    maxTasks: 1,
  })

  // 异步加载本周统计数据
  useEffect(() => {
    const loadStats = async () => {
      const current = dayjs(selectedDate)
      const weekStart = current.startOf('isoWeek')
      const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

      const stats: DayStats[] = []

      for (let i = 0; i < 7; i++) {
        const date = weekStart.add(i, 'day').format('YYYY-MM-DD')
        const scheduled = await taskService.getScheduledTasksForDate(date)
        const allDay = await taskService.getAllDayTasksForDate(date)
        const allTasks = [...scheduled, ...allDay]

        const completed = allTasks.filter(t => t.status === 'done').length
        const totalHours = scheduled.reduce((sum, t) => sum + (t.schedule?.planned_duration || 0), 0)

        stats.push({
          date,
          dayLabel: dayLabels[i],
          total: allTasks.length,
          completed,
          totalHours,
        })
      }

      setWeekStats(stats)

      // 计算总体统计
      const totalTasks = stats.reduce((sum, d) => sum + d.total, 0)
      const completedTasks = stats.reduce((sum, d) => sum + d.completed, 0)
      const totalHours = stats.reduce((sum, d) => sum + d.totalHours, 0)
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      const maxTasks = Math.max(...stats.map(d => d.total), 1)

      setOverallStats({ totalTasks, completedTasks, totalHours, completionRate, maxTasks })
    }

    loadStats()
  }, [selectedDate])

  const currentWeek = dayjs(selectedDate).isoWeek()

  return (
    <div
      style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 32 }}
      >
        <h1
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 48,
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'var(--color-gray-800)',
            margin: 0,
          }}
        >
          Insights
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-gray-400)',
            marginTop: 8,
          }}
        >
          第 {currentWeek} 周 · {dayjs(selectedDate).startOf('isoWeek').format('MM/DD')} - {dayjs(selectedDate).endOf('isoWeek').format('MM/DD')}
        </p>
      </motion.div>

      {/* Bento Box 布局 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'auto auto',
          gap: 20,
        }}
      >
        {/* 卡片1：本周任务数柱状图 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            gridColumn: 'span 2',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 32,
            padding: 28,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-gray-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 24,
            }}
          >
            本周每日任务
          </div>

          {/* 柱状图 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 160,
              gap: 12,
            }}
          >
            {weekStats.map((day, index) => {
              const height = overallStats.maxTasks > 0
                ? (day.total / overallStats.maxTasks) * 120
                : 0
              const isToday = day.date === dayjs().format('YYYY-MM-DD')
              const isSelected = day.date === selectedDate

              return (
                <motion.div
                  key={day.date}
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(height, 4) }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: day.total > 0 ? 'var(--color-gray-700)' : 'var(--color-gray-300)',
                    }}
                  >
                    {day.total || '-'}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 48,
                      height: Math.max(height, 4),
                      borderRadius: 8,
                      background: isToday
                        ? 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)'
                        : isSelected
                          ? 'linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%)'
                          : day.total > 0
                            ? 'linear-gradient(180deg, #E5E7EB 0%, #D1D5DB 100%)'
                            : '#F3F4F6',
                      transition: 'background 0.3s',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? 'var(--color-primary)' : 'var(--color-gray-400)',
                    }}
                  >
                    {day.dayLabel}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* 卡片2：执行率 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 32,
            padding: 28,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-gray-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            计划执行率
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 72,
                fontWeight: 400,
                fontStyle: 'italic',
                color: overallStats.completionRate >= 80
                  ? 'var(--color-success)'
                  : overallStats.completionRate >= 50
                    ? 'var(--color-warning)'
                    : 'var(--color-primary)',
                lineHeight: 1,
              }}
            >
              {overallStats.completionRate}
            </span>
            <span
              style={{
                fontSize: 24,
                color: 'var(--color-gray-300)',
                fontWeight: 300,
              }}
            >
              %
            </span>
          </div>

          <div style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>
            已完成 {overallStats.completedTasks} / {overallStats.totalTasks} 项任务
          </div>
        </motion.div>

        {/* 卡片3：总计时长 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 32,
            padding: 28,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-gray-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            本周排班时长
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 72,
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'var(--color-primary)',
                lineHeight: 1,
              }}
            >
              {overallStats.totalHours.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: 24,
                color: 'var(--color-gray-300)',
                fontWeight: 300,
              }}
            >
              h
            </span>
          </div>

          <div style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>
            平均每日 {(overallStats.totalHours / 7).toFixed(1)} 小时
          </div>
        </motion.div>
      </div>

      {/* 提示文字 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          marginTop: 32,
          padding: '16px 20px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderRadius: 16,
          fontSize: 13,
          color: 'var(--color-gray-500)',
          lineHeight: 1.6,
        }}
      >
        💡 <strong>提示：</strong>导出 CSV 数据后，可以交给 AI 进行更深入的时间分析和复盘建议。
      </motion.div>
    </div>
  )
}
