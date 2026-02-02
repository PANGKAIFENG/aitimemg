import { LeftOutlined, RightOutlined, MoreOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { Dropdown, message, Popover, Calendar, theme } from 'antd'
import type { MenuProps } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exportAllData, importData } from '../services/taskService'
import type { ExportData } from '../services/taskService'

interface HeaderProps {
  selectedDate: string
  onDateChange: (date: string) => void
  progress: { completed: number; total: number }
  timeOccupancy: number // 时间槽占用（小时）
  onExport?: () => void
  onDataChange?: () => void // 数据导入后刷新
  datesWithTasks?: Set<string> // 有任务的日期集合，用于日历显示小点
}

export function Header({ selectedDate, onDateChange, progress, timeOccupancy, onExport, onDataChange, datesWithTasks }: HeaderProps) {
  const date = dayjs(selectedDate)
  const isToday = date.isSame(dayjs(), 'day')
  const { token } = theme.useToken()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const goToPrev = () => {
    onDateChange(date.subtract(1, 'day').format('YYYY-MM-DD'))
  }

  const goToNext = () => {
    onDateChange(date.add(1, 'day').format('YYYY-MM-DD'))
  }

  const goToToday = () => {
    onDateChange(dayjs().format('YYYY-MM-DD'))
  }

  // 进度颜色
  const getProgressColor = () => {
    if (progress.total === 0) return 'var(--color-gray-400)'
    const percentage = (progress.completed / progress.total) * 100
    if (percentage >= 80) return 'var(--color-success)'
    if (percentage >= 50) return 'var(--color-warning)'
    return 'var(--color-primary)'
  }

  // 导出 JSON 数据
  const handleExportData = async () => {
    try {
      const data = await exportAllData()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `temporal_backup_${dayjs().format('YYYY-MM-DD_HHmm')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      message.success(`导出成功！包含 ${data.tasks.length} 个任务`)
    } catch (error) {
      console.error('Export error:', error)
      message.error('导出失败，请重试')
    }
  }

  // 导入 JSON 数据
  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data: ExportData = JSON.parse(text)

        if (!data.tasks || !data.schedules) {
          message.error('文件格式不正确')
          return
        }

        const result = await importData(data)
        message.success(`导入成功！恢复了 ${result.tasksImported} 个任务`)
        onDataChange?.()
      } catch (error) {
        console.error('Import error:', error)
        message.error('导入失败，请检查文件格式')
      }
    }
    input.click()
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'export-json',
      icon: <DownloadOutlined />,
      label: '导出数据 (JSON)',
      onClick: handleExportData,
    },
    {
      key: 'import-json',
      icon: <UploadOutlined />,
      label: '导入数据 (JSON)',
      onClick: handleImportData,
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      label: '偏好设置',
    },
    {
      key: 'export',
      label: '导出 CSV',
      onClick: onExport,
    },
    {
      type: 'divider',
    },
    {
      key: 'about',
      label: '关于 Temporal',
      onClick: () => navigate('/home'),
    },
  ]

  const handleDateSelect = (value: Dayjs) => {
    onDateChange(value.format('YYYY-MM-DD'))
    setOpen(false)
  }

  // 自定义日期单元格渲染：在有任务的日期下方显示小点
  const cellRender = (current: Dayjs) => {
    const dateStr = current.format('YYYY-MM-DD')
    const hasTask = datesWithTasks?.has(dateStr)

    if (hasTask) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
            }}
          />
        </div>
      )
    }
    return null
  }

  // 日历弹窗内容
  const calendarContent = (
    <div style={{ width: 300, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG }}>
      <Calendar
        fullscreen={false}
        value={date}
        onChange={handleDateSelect}
        cellRender={cellRender}
      />
    </div>
  )

  return (
    <div
      style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--color-base)',
      }}
    >
      {/* 左侧：日期 - 使用衬线体 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Popover
          content={calendarContent}
          trigger="click"
          open={open}
          onOpenChange={setOpen}
          placement="bottomLeft"
          arrow={false}
          overlayInnerStyle={{ padding: 0 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              cursor: 'pointer',
              userSelect: 'none',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              marginLeft: -8,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {/* 日期数字 - 衬线体 */}
            <span
              style={{
                fontSize: 42,
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                color: 'var(--color-gray-800)',
                lineHeight: 1,
              }}
            >
              {date.format('D')}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                }}
              >
                {date.format('M')}月
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
                {date.format('dddd')}
              </span>
            </div>
          </div>
        </Popover>

        {/* 日期切换按钮 - 无边框阴影 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={goToPrev}
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              color: 'var(--color-gray-500)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            <LeftOutlined style={{ fontSize: 10 }} />
          </button>
          <button
            onClick={goToNext}
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              color: 'var(--color-gray-500)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            <RightOutlined style={{ fontSize: 10 }} />
          </button>
          {!isToday && (
            <button
              onClick={goToToday}
              style={{
                marginLeft: 8,
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-gray-600)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                e.currentTarget.style.color = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.color = 'var(--color-gray-600)'
              }}
            >
              今天
            </button>
          )}
        </div>
      </div>

      {/* 右侧：容量 + 更多 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* 状态指示器：任务完成进度 + 时间占用 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* 任务完成进度 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>✅</span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: getProgressColor(),
              }}
            >
              {progress.completed}/{progress.total}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>完成</span>
          </div>

          {/* 分隔线 */}
          <div style={{ width: 1, height: 16, backgroundColor: 'var(--color-gray-200)' }} />

          {/* 时间占用 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>📅</span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--color-gray-700)',
              }}
            >
              {timeOccupancy}h
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>已排</span>
          </div>
        </div>

        {/* 更多菜单 */}
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <button
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              color: 'var(--color-gray-400)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            <MoreOutlined style={{ fontSize: 18 }} />
          </button>
        </Dropdown>
      </div>
    </div>
  )
}
