import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import { LeftOutlined, RightOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons'

interface DateTimePickerProps {
    open: boolean
    currentDate: string | null      // YYYY-MM-DD 格式
    currentStartTime: number | null // 开始时间，小时数，如 14.5 = 14:30
    currentEndTime: number | null   // 结束时间，小时数
    onSelect: (date: string, startTime: number, endTime: number) => void
    onClose: () => void
}

// 生成半小时粒度的时间列表
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2)
    const minutes = (i % 2) * 30
    return {
        value: hours + minutes / 60,
        label: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
})

export function DateTimePicker({
    open,
    currentDate,
    currentStartTime,
    currentEndTime,
    onSelect,
    onClose
}: DateTimePickerProps) {
    // 当前选中的日期和时间
    const [selectedDate, setSelectedDate] = useState<string>(
        currentDate || dayjs().format('YYYY-MM-DD')
    )
    const [startTime, setStartTime] = useState<number>(
        currentStartTime ?? 9 // 默认早上9点
    )
    const [endTime, setEndTime] = useState<number>(
        currentEndTime ?? 10 // 默认早上10点
    )

    // 日历显示的月份
    const [displayMonth, setDisplayMonth] = useState<dayjs.Dayjs>(
        dayjs(currentDate || undefined)
    )

    // 时间列表的 ref
    const startTimeListRef = useRef<HTMLDivElement>(null)
    const endTimeListRef = useRef<HTMLDivElement>(null)

    // 当弹窗打开时，重置状态
    useEffect(() => {
        if (open) {
            const date = currentDate || dayjs().format('YYYY-MM-DD')
            setSelectedDate(date)
            setStartTime(currentStartTime ?? 9)
            setEndTime(currentEndTime ?? (currentStartTime ? currentStartTime + 1 : 10))
            setDisplayMonth(dayjs(date))
        }
    }, [open, currentDate, currentStartTime, currentEndTime])

    // 弹窗打开时，自动滚动到选中的时间位置
    useEffect(() => {
        if (open) {
            // 延迟执行，等待 DOM 渲染完成
            setTimeout(() => {
                // 滚动开始时间列表
                if (startTimeListRef.current) {
                    const startTimeValue = currentStartTime ?? 9
                    const startIndex = TIME_SLOTS.findIndex(slot => slot.value === startTimeValue)
                    if (startIndex >= 0) {
                        const itemHeight = 36 // 每个时间项的高度
                        const scrollPosition = Math.max(0, startIndex * itemHeight - 100) // 留一些上方空间
                        startTimeListRef.current.scrollTop = scrollPosition
                    }
                }
                // 滚动结束时间列表
                if (endTimeListRef.current) {
                    const endTimeValue = currentEndTime ?? (currentStartTime ? currentStartTime + 1 : 10)
                    // 结束时间列表是过滤后的，需要找到对应的索引
                    const startTimeValue = currentStartTime ?? 9
                    const filteredSlots = TIME_SLOTS.filter(slot => slot.value > startTimeValue)
                    const endIndex = filteredSlots.findIndex(slot => slot.value === endTimeValue)
                    if (endIndex >= 0) {
                        const itemHeight = 36
                        const scrollPosition = Math.max(0, endIndex * itemHeight - 100)
                        endTimeListRef.current.scrollTop = scrollPosition
                    }
                }
            }, 50)
        }
    }, [open, currentStartTime, currentEndTime])

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

    // 生成日历数据
    const calendarDays = useMemo(() => {
        const start = displayMonth.startOf('month')
        const end = displayMonth.endOf('month')
        const startDay = start.day() // 0 = 周日
        const daysInMonth = end.date()

        const days: { date: dayjs.Dayjs; isCurrentMonth: boolean }[] = []

        // 上月的天数
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                date: start.subtract(i + 1, 'day'),
                isCurrentMonth: false
            })
        }

        // 本月的天数
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: displayMonth.date(i),
                isCurrentMonth: true
            })
        }

        // 补齐到 6 行（42 天）
        const remaining = 42 - days.length
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: end.add(i, 'day'),
                isCurrentMonth: false
            })
        }

        return days
    }, [displayMonth])

    // 可选的结束时间列表（必须大于开始时间）
    const availableEndTimes = useMemo(() => {
        return TIME_SLOTS.filter(slot => slot.value > startTime)
    }, [startTime])

    // 当开始时间改变时，确保结束时间有效
    useEffect(() => {
        if (endTime <= startTime) {
            // 设置结束时间为开始时间 +0.5 或 +1
            const newEndTime = Math.min(startTime + 1, 24)
            setEndTime(newEndTime)
        }
    }, [startTime, endTime])

    const handleConfirm = () => {
        onSelect(selectedDate, startTime, endTime)
        onClose()
    }

    const today = dayjs().format('YYYY-MM-DD')
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']

    // 计算时长
    const duration = endTime - startTime
    const durationText = duration >= 1
        ? `${Math.floor(duration)}小时${duration % 1 === 0.5 ? '30分钟' : ''}`
        : `${duration * 60}分钟`

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        zIndex: 1100,
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
                            background: 'var(--color-surface)',
                            borderRadius: 'var(--radius-xl)',
                            boxShadow: 'var(--shadow-xl)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* 标题 */}
                        <div style={{
                            padding: '20px 24px 16px',
                            borderBottom: '1px solid var(--color-gray-100)',
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: 18,
                                fontWeight: 600,
                                color: 'var(--color-gray-800)',
                            }}>
                                选择时间
                            </h3>
                        </div>

                        {/* 内容区：日历 + 时间选择 */}
                        <div style={{
                            display: 'flex',
                            padding: '16px 24px',
                            gap: 24,
                        }}>
                            {/* 左侧：日历 */}
                            <div style={{ width: 280 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 12,
                                    color: 'var(--color-gray-500)',
                                    fontSize: 13,
                                }}>
                                    <CalendarOutlined />
                                    <span>日期</span>
                                </div>

                                {/* 月份导航 */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 12,
                                }}>
                                    <button
                                        onClick={() => setDisplayMonth(displayMonth.subtract(1, 'month'))}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            padding: 8,
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'var(--color-gray-500)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <LeftOutlined />
                                    </button>
                                    <span style={{
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: 'var(--color-gray-700)',
                                    }}>
                                        {displayMonth.format('YYYY年MM月')}
                                    </span>
                                    <button
                                        onClick={() => setDisplayMonth(displayMonth.add(1, 'month'))}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            padding: 8,
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'var(--color-gray-500)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <RightOutlined />
                                    </button>
                                </div>

                                {/* 星期标题 */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: 4,
                                    marginBottom: 4,
                                }}>
                                    {weekDays.map((day) => (
                                        <div
                                            key={day}
                                            style={{
                                                textAlign: 'center',
                                                fontSize: 12,
                                                color: 'var(--color-gray-400)',
                                                padding: '4px 0',
                                            }}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* 日期网格 */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: 4,
                                }}>
                                    {calendarDays.map(({ date, isCurrentMonth }, index) => {
                                        const dateStr = date.format('YYYY-MM-DD')
                                        const isSelected = dateStr === selectedDate
                                        const isToday = dateStr === today

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedDate(dateStr)}
                                                style={{
                                                    border: 'none',
                                                    background: isSelected
                                                        ? 'var(--color-primary)'
                                                        : 'transparent',
                                                    color: isSelected
                                                        ? 'white'
                                                        : isCurrentMonth
                                                            ? 'var(--color-gray-700)'
                                                            : 'var(--color-gray-300)',
                                                    fontSize: 13,
                                                    fontWeight: isToday ? 600 : 400,
                                                    padding: '8px 0',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.backgroundColor = 'transparent'
                                                    }
                                                }}
                                            >
                                                {date.date()}
                                                {isToday && !isSelected && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        bottom: 2,
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: 4,
                                                        height: 4,
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--color-primary)',
                                                    }} />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 右侧：开始时间 + 结束时间 */}
                            <div style={{ display: 'flex', gap: 16 }}>
                                {/* 开始时间 */}
                                <div style={{ width: 100 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 12,
                                        color: 'var(--color-gray-500)',
                                        fontSize: 13,
                                    }}>
                                        <ClockCircleOutlined />
                                        <span>开始</span>
                                    </div>

                                    <div
                                        ref={startTimeListRef}
                                        style={{
                                            maxHeight: 280,
                                            overflowY: 'auto',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: 'var(--color-gray-50)',
                                            padding: 4,
                                        }}>
                                        {TIME_SLOTS.map((slot) => {
                                            const isSelected = slot.value === startTime
                                            return (
                                                <button
                                                    key={slot.value}
                                                    onClick={() => setStartTime(slot.value)}
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        border: 'none',
                                                        background: isSelected
                                                            ? 'var(--color-primary)'
                                                            : 'transparent',
                                                        color: isSelected ? 'white' : 'var(--color-gray-600)',
                                                        fontSize: 13,
                                                        padding: '8px 12px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'all 0.15s',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.backgroundColor = 'transparent'
                                                        }
                                                    }}
                                                >
                                                    {slot.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* 结束时间 */}
                                <div style={{ width: 100 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 12,
                                        color: 'var(--color-gray-500)',
                                        fontSize: 13,
                                    }}>
                                        <ClockCircleOutlined />
                                        <span>结束</span>
                                    </div>

                                    <div
                                        ref={endTimeListRef}
                                        style={{
                                            maxHeight: 280,
                                            overflowY: 'auto',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: 'var(--color-gray-50)',
                                            padding: 4,
                                        }}>
                                        {availableEndTimes.map((slot) => {
                                            const isSelected = slot.value === endTime
                                            return (
                                                <button
                                                    key={slot.value}
                                                    onClick={() => setEndTime(slot.value)}
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        border: 'none',
                                                        background: isSelected
                                                            ? 'var(--color-primary)'
                                                            : 'transparent',
                                                        color: isSelected ? 'white' : 'var(--color-gray-600)',
                                                        fontSize: 13,
                                                        padding: '8px 12px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'all 0.15s',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.backgroundColor = 'transparent'
                                                        }
                                                    }}
                                                >
                                                    {slot.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 时长提示 */}
                        <div style={{
                            padding: '0 24px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: 'var(--color-gray-500)',
                            fontSize: 13,
                        }}>
                            <span>时长：</span>
                            <span style={{
                                color: 'var(--color-primary)',
                                fontWeight: 500
                            }}>
                                {durationText}
                            </span>
                        </div>

                        {/* 底部操作 */}
                        <div style={{
                            padding: '16px 24px 20px',
                            borderTop: '1px solid var(--color-gray-100)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                        }}>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--color-gray-100)',
                                    color: 'var(--color-gray-600)',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--color-gray-200)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
                                }}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleConfirm}
                                style={{
                                    padding: '10px 24px',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                确定
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
