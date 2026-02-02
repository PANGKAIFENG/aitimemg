import { useState, useEffect, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
import { DndContext, pointerWithin, rectIntersection, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import type { CollisionDetection } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'

import { Sidebar } from '../../components/Sidebar'
import type { ViewMode } from '../../components/Sidebar'
import { Header } from '../../components/Header'
import { DailyTray } from '../../components/DailyTray'
import { SplitPaneContainer } from '../../components/timeline/SplitPaneContainer'
import { TaskModal } from '../../components/TaskModal'
import { CommandBar } from '../../components/CommandBar'
import { InsightsView } from '../../components/InsightsView'
import { ExportModal } from '../../components/ExportModal'
import { DraggableTrayItem } from '../../components/DraggableTrayItem'
// ScheduleCard is used in Timeline component, not here directly
import { ContextMenu } from '../../components/ContextMenu'
import { ConfirmModal } from '../../components/ConfirmModal'

import type { Task, TaskWithSchedule, TaskGroup } from '../../types'
import * as taskService from '../../services/taskService'
import { initDatabase, syncFromCloud, getDatesWithSchedules } from '../../services/taskService'

export function ExecutePage() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('execute')
  const [tasks, setTasks] = useState<Task[]>([])
  const [scheduledTasks, setScheduledTasks] = useState<TaskWithSchedule[]>([])
  const [allDayTasks, setAllDayTasks] = useState<TaskWithSchedule[]>([])
  const [overdueTasks, setOverdueTasks] = useState<TaskWithSchedule[]>([]) // 延期任务
  const [datesWithTasks, setDatesWithTasks] = useState<Set<string>>(new Set()) // 有任务的日期集合
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [timeOccupancy, setTimeOccupancy] = useState(0)

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<import('../../types').ScheduleEvent | null>(null)
  // Delete confirm modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<{ id: string, title: string } | null>(null)

  const [commandBarOpen, setCommandBarOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [createAtTime, setCreateAtTime] = useState<number | null>(null) // 点击时间轴新建任务的时间

  // 拖拽状态
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<TaskWithSchedule | null>(null)
  const [activeSource, setActiveSource] = useState<string | null>(null)

  // 上下文菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    taskId: string
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )


  // 自定义碰撞检测
  const customCollisionDetection: CollisionDetection = (args) => {
    // 1. 优先使用 pointerWithin 检测光标下的元素 (最准确，特别是对于多泳道/滚动容器)
    const pointerCollisions = pointerWithin(args)

    // 检查是否有特殊目标 (Sidebar/DailyTray)
    const specialTarget = pointerCollisions.find(c =>
      c.id === 'sidebar' || c.id === 'daily-tray'
    )
    if (specialTarget) {
      return [specialTarget]
    }

    // 检查是否有时间轴槽位 (timeline-x)
    const timelineTarget = pointerCollisions.find(c =>
      String(c.id).startsWith('timeline-')
    )
    if (timelineTarget) {
      return [timelineTarget]
    }

    // 2. 如果没有检测到 pointer 下的元素 (例如快速拖拽导致光标在元素外)，回退到 rectIntersection
    return rectIntersection(args)
  }

  // 加载数据
  const loadData = useCallback(async () => {
    // 加载侧边栏任务（未排班的）
    const unscheduled = await taskService.getUnscheduledTasks()
    setTasks(unscheduled)

    // 加载当日已排班任务
    const scheduled = (await taskService.getScheduledTasksForDate(selectedDate))
      .filter(t => !t.schedule?.is_all_day)
    setScheduledTasks(scheduled)

    // 加载当日待排班任务（全天槽）
    const allDay = await taskService.getAllDayTasksForDate(selectedDate)
    setAllDayTasks(allDay)

    // 加载延期任务（仅在查看当天时）
    const today = dayjs().format('YYYY-MM-DD')
    if (selectedDate === today) {
      const overdue = await taskService.getOverdueTasks(today)
      setOverdueTasks(overdue)
    } else {
      setOverdueTasks([])
    }

    // 计算任务完成进度和时间占用
    const prog = await taskService.getTaskProgress(selectedDate)
    setProgress(prog)
    const occ = await taskService.getTimeSlotOccupancy(selectedDate)
    setTimeOccupancy(occ)

    // 加载所有有任务的日期（用于日历显示小点）
    const dates = await getDatesWithSchedules()
    setDatesWithTasks(dates)
  }, [selectedDate])

  // 记录是否首次加载，避免每次切换日期都同步云端
  const isFirstMount = useRef(true)

  // 初始化数据库并加载数据（本地优先 + 后台同步）
  useEffect(() => {
    const init = async () => {
      // 1. 初始化数据库
      await initDatabase()

      // 每次切换日期时，先清除旧数据，防止闪现上一天的数据
      setScheduledTasks([])
      setAllDayTasks([])
      setOverdueTasks([])

      // 2. 立即从本地加载（首屏渲染）
      await loadData()

      // 3. 仅在首次加载时后台同步云端数据
      if (isFirstMount.current) {
        isFirstMount.current = false
        syncFromCloud().then(() => {
          loadData() // 同步完成后刷新数据
        }).catch(console.error)
      }
    }
    init()
  }, [loadData])

  // 全局快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果在输入框中，不处理快捷键（除了 Escape）
      const isInputActive = document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'

      // Cmd/Ctrl + K: 快速创建任务
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandBarOpen(true)
        return
      }

      // Escape: 关闭所有弹窗
      if (e.key === 'Escape') {
        if (commandBarOpen) {
          setCommandBarOpen(false)
        } else if (modalOpen) {
          setModalOpen(false)
          setEditingTask(null)
        } else if (exportModalOpen) {
          setExportModalOpen(false)
        } else if (deleteConfirmOpen) {
          setDeleteConfirmOpen(false)
          setTaskToDelete(null)
        }
        return
      }

      // 以下快捷键在输入时不触发
      if (isInputActive) return

      // 左右箭头: 日期导航
      if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setSelectedDate(dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD'))
        return
      }
      if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setSelectedDate(dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD'))
        return
      }

      // T: 回到今天
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        setSelectedDate(dayjs().format('YYYY-MM-DD'))
        return
      }

      // E: 切换执行/复盘视图
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        setViewMode(viewMode === 'execute' ? 'insights' : 'execute')
        return
      }

      // N: 新建任务（打开 CommandBar）
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setCommandBarOpen(true)
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandBarOpen, modalOpen, exportModalOpen, selectedDate, viewMode])

  // 创建任务
  const handleCreateTask = async (title: string, group: TaskGroup = 'neither') => {
    const newTask = await taskService.createTask({ title, group })

    // 如果是从时间轴点击创建的，自动安排到点击的时间
    if (createAtTime !== null) {
      await taskService.createScheduleEvent({
        task_id: newTask.id,
        date: selectedDate,
        planned_start: createAtTime,
        planned_duration: 0.5, // 默认 30 分钟
        is_all_day: false,
      })
      setCreateAtTime(null)
    }

    await loadData()
    setCommandBarOpen(false)
  }

  // 处理点击时间轴新建任务
  const handleCreateAtTime = (hour: number) => {
    setCreateAtTime(hour)
    setCommandBarOpen(true)
  }

  // 编辑任务
  const handleEditTask = async (task: Task) => {
    setEditingTask(task)
    // 异步加载该任务的 schedule 信息
    const schedule = await taskService.getScheduleEventByTaskId(task.id)
    setEditingSchedule(schedule || null)
    setModalOpen(true)
  }

  // 更新任务
  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    await taskService.updateTask(id, updates)
    await loadData()
    setModalOpen(false)
    setEditingTask(null)
    setEditingSchedule(null)
  }

  // 删除任务
  const handleDeleteTask = async (id: string) => {
    await taskService.hardDeleteTask(id)
    await loadData()
    setModalOpen(false)
    setEditingTask(null)
    setEditingSchedule(null)
  }

  // 切换任务完成状态
  const handleToggleComplete = async (taskId: string) => {
    const task = await taskService.getTaskById(taskId)
    if (task) {
      const newStatus = task.status === 'done' ? 'todo' : 'done'
      await taskService.updateTask(taskId, { status: newStatus })
      await loadData()
    }
  }

  // 放弃任务（将状态设为 abandoned）
  const handleAbandonTask = async (taskId: string) => {
    await taskService.updateTask(taskId, { status: 'abandoned' })
    await loadData()
  }

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    const task = event.active.data.current?.task as TaskWithSchedule
    const source = event.active.data.current?.source as string

    if (task) {
      setActiveTask(task)
    }
    if (source) {
      setActiveSource(source)
    }
  }

  // 拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setActiveTask(null)
    setActiveSource(null)

    if (!over) return

    const taskId = active.id as string
    const dropTarget = over.id as string

    // 获取任务
    const task = await taskService.getTaskById(taskId)
    if (!task) return

    // 获取任务当前的排班信息
    const existingSchedule = await taskService.getScheduleEventByTaskId(taskId)
    const currentDuration = existingSchedule?.planned_duration ?? 1
    const scheduleId = existingSchedule?.id || crypto.randomUUID()

    // 乐观更新：根据目标位置立即更新 UI State
    let optimisticScheduledTasks = [...scheduledTasks]
    let optimisticAllDayTasks = [...allDayTasks]
    let optimisticUnscheduledTasks = [...tasks]

    // 从原来的列表中移除
    optimisticScheduledTasks = optimisticScheduledTasks.filter(t => t.id !== taskId)
    optimisticAllDayTasks = optimisticAllDayTasks.filter(t => t.id !== taskId)
    optimisticUnscheduledTasks = optimisticUnscheduledTasks.filter(t => t.id !== taskId)

    // 构造新的 Schedule 对象
    const newSchedule: any = {
      id: scheduleId,
      task_id: taskId,
      date: selectedDate,
      planned_duration: currentDuration,
      is_all_day: false,
      planned_start: 0
    }


    // 1. 拖到"今日待排班"槽 (全天任务)
    if (dropTarget === 'daily-tray') {
      newSchedule.is_all_day = true
      newSchedule.planned_start = 0

      const updatedTask = { ...task, schedule: newSchedule }
      setAllDayTasks([...optimisticAllDayTasks, updatedTask])
      setScheduledTasks(optimisticScheduledTasks)
      setTasks(optimisticUnscheduledTasks)

      // 异步保存
      await taskService.createScheduleEvent({
        task_id: taskId,
        date: selectedDate,
        planned_start: 0,
        planned_duration: currentDuration,
        is_all_day: true,
      })
      await loadData()
      return
    }

    // 2. 拖到时间轴 (普通排班)
    if (dropTarget.startsWith('timeline-')) {
      const hour = parseFloat(dropTarget.replace('timeline-', ''))
      newSchedule.is_all_day = false
      newSchedule.planned_start = hour

      const updatedTask = { ...task, schedule: newSchedule }
      setScheduledTasks([...optimisticScheduledTasks, updatedTask])
      setAllDayTasks(optimisticAllDayTasks)
      setTasks(optimisticUnscheduledTasks)

      // 异步保存
      await taskService.createScheduleEvent({
        task_id: taskId,
        date: selectedDate,
        planned_start: hour,
        planned_duration: currentDuration,
        is_all_day: false,
      })
      await loadData()
      return
    }

    // 3. 拖到侧边栏 (取消排班)
    if (dropTarget === 'sidebar') {
      setScheduledTasks(optimisticScheduledTasks)
      setAllDayTasks(optimisticAllDayTasks)
      setTasks([...optimisticUnscheduledTasks, task])

      if (existingSchedule) {
        await taskService.deleteScheduleEvent(existingSchedule.id)
      }
      await loadData()
      return
    }
  }

  const handleScheduleUpdate = async (taskId: string, start: number, duration: number) => {
    const schedule = await taskService.getScheduleEventByTaskId(taskId)
    if (schedule) {
      await taskService.updateScheduleEvent(schedule.id, {
        planned_start: start,
        planned_duration: duration,
        is_all_day: false,
      })
      await loadData()
    }
  }

  // 处理右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent, taskId: string) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      taskId,
    })
  }, [])

  // 复制任务
  const handleDuplicateTask = async () => {
    if (!contextMenu) return
    const { taskId } = contextMenu

    // 查找任务
    const originalTask = await taskService.getTaskById(taskId)
    if (!originalTask) return

    // 创建副本
    const newTitle = `${originalTask.title} (副本)`
    await taskService.createTask({
      title: newTitle,
      notes: originalTask.notes ?? undefined,
      group: originalTask.group,
    })

    await loadData()
    // 不关闭菜单，让它自动关闭或保留？一般操作后关闭
  }

  // 删除任务（带确认）
  const handleDeleteTaskWithConfirm = async () => {
    if (!contextMenu) return
    const { taskId } = contextMenu

    // 查找任务名称用于提示
    const task = await taskService.getTaskById(taskId)
    if (!task) return

    setTaskToDelete({ id: task.id, title: task.title })
    setDeleteConfirmOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await handleDeleteTask(taskToDelete.id)
      setDeleteConfirmOpen(false)
      setTaskToDelete(null)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* 侧边栏 */}
        <Sidebar
          tasks={tasks}
          collapsed={sidebarCollapsed}
          viewMode={viewMode}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCreateTask={() => setCommandBarOpen(true)}
          onEditTask={handleEditTask}
          onViewModeChange={setViewMode}
          onContextMenu={handleContextMenu}
        />

        {/* 主内容区 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 顶部栏 */}
          <Header
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            progress={progress}
            timeOccupancy={timeOccupancy}
            onExport={() => setExportModalOpen(true)}
            onDataChange={loadData}
            datesWithTasks={datesWithTasks}
          />

          {viewMode === 'execute' ? (
            <>
              {/* 今日待排班槽 + 延期任务 */}
              <DailyTray
                tasks={allDayTasks}
                overdueTasks={overdueTasks}
                currentDate={selectedDate}
                onEditTask={handleEditTask}
                onToggleComplete={handleToggleComplete}
                onContextMenu={handleContextMenu}
                onAbandon={handleAbandonTask}
              />

              {/* 时间轴 (分屏容器) */}
              <SplitPaneContainer
                tasks={scheduledTasks}
                selectedDate={selectedDate}
                onEditTask={handleEditTask}
                onToggleComplete={handleToggleComplete}
                onScheduleUpdate={handleScheduleUpdate}
                onCreateAtTime={handleCreateAtTime}
                onContextMenu={handleContextMenu}
              />
            </>
          ) : (
            /* 复盘视图 */
            <InsightsView selectedDate={selectedDate} />
          )}
        </div>
      </div>



      <TaskModal
        key={editingTask?.id || 'new-task-modal'}
        open={modalOpen}
        task={editingTask}
        schedule={editingSchedule}
        onClose={() => {
          setModalOpen(false)
          setEditingTask(null)
          setEditingSchedule(null)
        }}
        onSave={handleUpdateTask}
        onCreate={handleCreateTask}
        onDelete={handleDeleteTask}
        onScheduleChange={async (taskId, date, startTime, duration) => {
          // 更新/创建排班事件
          await taskService.createScheduleEvent({
            task_id: taskId,
            date: date,
            planned_start: startTime,
            planned_duration: duration,
            is_all_day: false,
          })

          // 更新当前编辑的 schedule 状态（只更新弹窗内显示的时间）
          const newSchedule = await taskService.getScheduleEventByTaskId(taskId)
          setEditingSchedule(newSchedule || null)

          // 刷新数据（保持当前日期不变）
          await loadData()
        }}
      />

      {/* 快速输入 */}
      <CommandBar
        open={commandBarOpen}
        onClose={() => {
          setCommandBarOpen(false)
          setCreateAtTime(null)
        }}
        onCreate={handleCreateTask}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />

      <ConfirmModal
        open={deleteConfirmOpen}
        title="删除任务"
        content={
          <span>
            确定要删除任务 <b>【{taskToDelete?.title}】</b> 吗？此操作无法撤销。
          </span>
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setTaskToDelete(null)
        }}
        confirmText="删除"
        confirmButtonColor="var(--color-danger)"
        isDanger={true}
      />

      <DragOverlay zIndex={9999} dropAnimation={null}>
        {activeId && activeTask ? (
          activeSource === 'sidebar' ? (
            // 侧边栏任务：渲染卡片样式
            <div
              className={`task-card group-${activeTask.group} executor-${activeTask.executor_type || 'human'}`}
              style={{ padding: '12px 16px', opacity: 1, cursor: 'grabbing', width: 300 }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: activeTask.status === 'done' ? 'var(--color-gray-400)' : 'var(--color-gray-800)',
                  textDecoration: activeTask.status === 'done' ? 'line-through' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {activeTask.executor_type === 'ai_auto' && <span title="AI全自动">🤖</span>}
                {activeTask.executor_type === 'ai_copilot' && <span className="icon-twinkle" title="AI协作">✨</span>}
                <span
                  dangerouslySetInnerHTML={{
                    __html: activeTask.title.replace(/【([^】]+)】/g, '<span class="tag-highlight">【$1】</span>'),
                  }}
                />
              </div>
            </div>
          ) : activeSource === 'timeline' ? ( // 使用 source 判断更准确
            // 时间轴上的任务 - 使用与原始卡片相同的宽度
            <div
              className={`task-card group-${activeTask.group} executor-${activeTask.executor_type || 'human'} ${activeTask.status === 'done' ? 'done' : ''}`}
              style={{
                width: 'calc(100vw - 340px - 80px - 48px)', // 与 Timeline.getTaskPosition 保持一致
                maxWidth: 600,
                minWidth: 200,
                height: (activeTask.schedule?.planned_duration || 1) * 60 - 4,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'grabbing',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ padding: '6px 10px', flex: 1 }}>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--color-gray-400)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                  }}
                >
                  {activeTask.schedule ? `${Math.floor(activeTask.schedule.planned_start)}:${(activeTask.schedule.planned_start % 1) * 60 === 0 ? '00' : '30'} - ${Math.floor(activeTask.schedule.planned_start + activeTask.schedule.planned_duration)}:${((activeTask.schedule.planned_start + activeTask.schedule.planned_duration) % 1) * 60 === 0 ? '00' : '30'}` : ''}
                </span>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    marginTop: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {activeTask.executor_type === 'ai_auto' && <span title="AI全自动">🤖</span>}
                  {activeTask.executor_type === 'ai_copilot' && <span className="icon-twinkle" title="AI协作">✨</span>}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: activeTask.title.replace(/【([^】]+)】/g, '<span class="tag-highlight">【$1】</span>'),
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            // 待办/全天任务 (DailyTray)
            <div style={{ minWidth: 320, maxWidth: 480 }}>{/* 增加宽度 */}
              <DraggableTrayItem
                task={activeTask}
                onEdit={() => { }}
                onToggle={() => { }}
                onContextMenu={() => { }}
              />
            </div>
          )
        ) : null}
      </DragOverlay>

      {/* 右键菜单 */}
      {
        contextMenu && contextMenu.visible && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onDuplicate={handleDuplicateTask}
            onDelete={handleDeleteTaskWithConfirm}
            onClose={() => setContextMenu(null)}
          />
        )
      }
    </DndContext >
  )
}
