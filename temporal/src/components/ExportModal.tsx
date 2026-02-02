import { useState } from 'react'
import { Modal, DatePicker, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import * as taskService from '../services/taskService'

const { RangePicker } = DatePicker

interface ExportModalProps {
  open: boolean
  onClose: () => void
}

export function ExportModal({ open, onClose }: ExportModalProps) {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().startOf('isoWeek'),
    dayjs().endOf('isoWeek'),
  ])
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!dateRange) {
      message.warning('请选择日期范围')
      return
    }

    setLoading(true)

    try {
      const startDate = dateRange[0].format('YYYY-MM-DD')
      const endDate = dateRange[1].format('YYYY-MM-DD')

      const csv = await taskService.exportToCsv(startDate, endDate)

      if (csv.split('\n').length <= 1) {
        message.info('所选日期范围内没有排班数据')
        setLoading(false)
        return
      }

      // 添加 UTF-8 BOM 解决中文乱码问题
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `temporal_${startDate}_${endDate}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      message.success('导出成功！')
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      message.error('导出失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 预设时间范围
  const presets = [
    { label: '本周', value: [dayjs().startOf('isoWeek'), dayjs().endOf('isoWeek')] as [Dayjs, Dayjs] },
    { label: '上周', value: [dayjs().subtract(1, 'week').startOf('isoWeek'), dayjs().subtract(1, 'week').endOf('isoWeek')] as [Dayjs, Dayjs] },
    { label: '本月', value: [dayjs().startOf('month'), dayjs().endOf('month')] as [Dayjs, Dayjs] },
    { label: '近 7 天', value: [dayjs().subtract(6, 'day'), dayjs()] as [Dayjs, Dayjs] },
    { label: '近 30 天', value: [dayjs().subtract(29, 'day'), dayjs()] as [Dayjs, Dayjs] },
  ]

  return (
    <AnimatePresence>
      {open && (
        <Modal
          open={open}
          onCancel={onClose}
          footer={null}
          centered
          width={420}
          closable={false}
          styles={{
            mask: { backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(4px)' },
          }}
          style={{ borderRadius: 24 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ padding: 28 }}
          >
            {/* 标题 */}
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 600,
                  color: 'var(--color-gray-800)',
                }}
              >
                导出数据
              </h2>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 13,
                  color: 'var(--color-gray-400)',
                }}
              >
                选择日期范围，导出 CSV 格式的任务排班数据
              </p>
            </div>

            {/* 预设按钮 */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-gray-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 10,
                }}
              >
                快速选择
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setDateRange(preset.value)}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: 20,
                      backgroundColor:
                        dateRange &&
                          dateRange[0].isSame(preset.value[0], 'day') &&
                          dateRange[1].isSame(preset.value[1], 'day')
                          ? 'var(--color-primary)'
                          : 'var(--color-gray-100)',
                      color:
                        dateRange &&
                          dateRange[0].isSame(preset.value[0], 'day') &&
                          dateRange[1].isSame(preset.value[1], 'day')
                          ? 'white'
                          : 'var(--color-gray-600)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 日期选择器 */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-gray-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 10,
                }}
              >
                自定义范围
              </div>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                style={{ width: '100%' }}
                size="large"
                format="YYYY-MM-DD"
              />
            </div>

            {/* 导出信息提示 */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderRadius: 12,
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--color-gray-500)', lineHeight: 1.6 }}>
                📄 导出格式：CSV（UTF-8 编码）
                <br />
                📊 包含字段：任务标题、状态、日期、时间段、时长、备注
              </div>
            </div>

            {/* 按钮 */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 12,
                  backgroundColor: 'transparent',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--color-gray-600)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                取消
              </button>
              <button
                onClick={handleExport}
                disabled={loading || !dateRange}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  border: 'none',
                  borderRadius: 12,
                  backgroundColor: 'var(--color-primary)',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'white',
                  cursor: loading || !dateRange ? 'not-allowed' : 'pointer',
                  opacity: loading || !dateRange ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                <DownloadOutlined />
                {loading ? '导出中...' : '导出 CSV'}
              </button>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  )
}
