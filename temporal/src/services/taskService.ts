// ============================================
// Temporal Phase 1 - 任务服务 (云端 + 本地缓存版本)
// ============================================

import { db, initDatabase, exportAllData, importData, clearAllData as clearDB } from './database'
import { cloudApi } from './cloudApi'
import type {
  Task,
  ScheduleEvent,
  CreateTaskInput,
  UpdateTaskInput,
  CreateScheduleEventInput,
  UpdateScheduleEventInput,
  TaskWithSchedule,
  TaskGroup,
} from '../types'
import type { ExportData } from './database'

// ============================================
// 初始化
// ============================================

export { initDatabase, exportAllData, importData }
export type { ExportData }

// 同步云端数据到本地（使用合并 API，一次请求）
export async function syncFromCloud(): Promise<void> {
  try {
    // 使用合并接口，一次获取所有数据
    const { tasks: cloudTasks, schedules: cloudSchedules } = await cloudApi.syncAll()

    // 修复云端返回的数据类型问题（API 可能把布尔值/数字存成了字符串）
    const normalizedSchedules = cloudSchedules.map((s: any) => ({
      ...s,
      is_all_day: s.is_all_day === true || s.is_all_day === 'true', // 转为布尔值
      planned_start: typeof s.planned_start === 'string' ? parseFloat(s.planned_start) : s.planned_start,
      planned_duration: typeof s.planned_duration === 'string' ? parseFloat(s.planned_duration) : s.planned_duration,
    }))

    // 只有当云端返回有效数据时才更新本地
    // 如果云端为空但本地有数据，保留本地数据（可能是云端同步延迟）
    const localTaskCount = await db.tasks.count()
    const localScheduleCount = await db.schedules.count()

    // 云端有数据 或者 本地也没数据时，才覆盖本地
    if (cloudTasks.length > 0 || localTaskCount === 0) {
      if (cloudTasks.length > 0) {
        await db.tasks.clear()
        await db.tasks.bulkAdd(cloudTasks)
      }
    }

    if (normalizedSchedules.length > 0 || localScheduleCount === 0) {
      if (normalizedSchedules.length > 0) {
        await db.schedules.clear()
        await db.schedules.bulkAdd(normalizedSchedules)
      }
    }

    console.log(`[Sync] Cloud: ${cloudTasks.length} tasks, ${normalizedSchedules.length} schedules | Local: ${localTaskCount} tasks, ${localScheduleCount} schedules`)
  } catch (error) {
    console.error('[Sync] Failed to sync from cloud:', error)
    // 如果云端同步失败，继续使用本地数据
  }
}

// ============================================
// 工具函数
// ============================================

function generateId(): string {
  return crypto.randomUUID()
}

// ============================================
// 任务 CRUD
// ============================================

// 获取所有任务
export async function getTasks(): Promise<Task[]> {
  return db.tasks.toArray()
}

// 根据 ID 获取单个任务
export async function getTaskById(id: string): Promise<Task | undefined> {
  return db.tasks.get(id)
}

// 根据分组获取任务
export async function getTasksByGroup(group: TaskGroup): Promise<Task[]> {
  return db.tasks
    .where('group')
    .equals(group)
    .filter((task) => task.status !== 'abandoned')
    .toArray()
}

// 创建任务
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const now = new Date().toISOString()

  const newTask: Task = {
    id: generateId(),
    title: input.title,
    notes: input.notes ?? null,
    status: 'todo',
    group: input.group ?? 'neither',
    created_at: now,
    updated_at: now,
  }

  // 先保存到本地
  await db.tasks.add(newTask)

  // 异步保存到云端
  cloudApi.saveTask(newTask).catch(console.error)

  return newTask
}

// 更新任务
export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const existingTask = await db.tasks.get(id)
  if (!existingTask) return null

  const updatedTask: Task = {
    ...existingTask,
    ...input,
    updated_at: new Date().toISOString(),
  }

  // 先保存到本地
  await db.tasks.put(updatedTask)

  // 异步保存到云端
  cloudApi.saveTask(updatedTask).catch(console.error)

  return updatedTask
}

// 删除任务（设置为 abandoned）
export async function deleteTask(id: string): Promise<boolean> {
  const result = await updateTask(id, { status: 'abandoned' })
  return result !== null
}

// 硬删除任务
export async function hardDeleteTask(id: string): Promise<boolean> {
  // 同时删除相关的排班事件
  const schedules = await db.schedules.where('task_id').equals(id).toArray()
  await db.schedules.where('task_id').equals(id).delete()
  const count = await db.tasks.where('id').equals(id).delete()

  // 异步从云端删除
  cloudApi.deleteTask(id).catch(console.error)
  for (const schedule of schedules) {
    cloudApi.deleteSchedule(schedule.id).catch(console.error)
  }

  return count > 0
}

// ============================================
// 排班事件 CRUD
// ============================================

// 获取所有排班事件
export async function getScheduleEvents(): Promise<ScheduleEvent[]> {
  return db.schedules.toArray()
}

// 获取所有有排班的日期集合（用于日历显示任务指示点）
export async function getDatesWithSchedules(): Promise<Set<string>> {
  const schedules = await db.schedules.toArray()
  const dates = new Set<string>()
  for (const schedule of schedules) {
    dates.add(schedule.date)
  }
  return dates
}

// 根据日期获取排班事件
export async function getScheduleEventsByDate(date: string): Promise<ScheduleEvent[]> {
  return db.schedules.where('date').equals(date).toArray()
}

// 根据任务 ID 获取排班事件
export async function getScheduleEventByTaskId(taskId: string): Promise<ScheduleEvent | undefined> {
  return db.schedules.where('task_id').equals(taskId).first()
}

// 创建排班事件
export async function createScheduleEvent(input: CreateScheduleEventInput): Promise<ScheduleEvent> {
  // 检查是否已存在该任务的排班
  const existing = await db.schedules.where('task_id').equals(input.task_id).first()

  if (existing) {
    // 更新现有排班
    const updated: ScheduleEvent = {
      ...existing,
      date: input.date,
      planned_start: input.planned_start,
      planned_duration: input.planned_duration,
      is_all_day: input.is_all_day ?? false,
    }
    await db.schedules.put(updated)

    // 异步保存到云端
    cloudApi.saveSchedule(updated).catch(console.error)

    return updated
  }

  const newEvent: ScheduleEvent = {
    id: generateId(),
    task_id: input.task_id,
    date: input.date,
    planned_start: input.planned_start,
    planned_duration: input.planned_duration,
    is_all_day: input.is_all_day ?? false,
    actual_done_at: null,
    offset_min: null,
  }

  await db.schedules.add(newEvent)

  // 异步保存到云端
  cloudApi.saveSchedule(newEvent).catch(console.error)

  return newEvent
}

// 更新排班事件
export async function updateScheduleEvent(id: string, input: UpdateScheduleEventInput): Promise<ScheduleEvent | null> {
  const existing = await db.schedules.get(id)
  if (!existing) return null

  const updatedEvent: ScheduleEvent = {
    ...existing,
    ...input,
  }

  await db.schedules.put(updatedEvent)

  // 异步保存到云端
  cloudApi.saveSchedule(updatedEvent).catch(console.error)

  return updatedEvent
}

// 删除排班事件
export async function deleteScheduleEvent(id: string): Promise<boolean> {
  const count = await db.schedules.where('id').equals(id).delete()

  // 异步从云端删除
  cloudApi.deleteSchedule(id).catch(console.error)

  return count > 0
}

// 根据任务 ID 删除排班事件
export async function deleteScheduleEventByTaskId(taskId: string): Promise<boolean> {
  const schedules = await db.schedules.where('task_id').equals(taskId).toArray()
  const count = await db.schedules.where('task_id').equals(taskId).delete()

  // 异步从云端删除
  for (const schedule of schedules) {
    cloudApi.deleteSchedule(schedule.id).catch(console.error)
  }

  return count > 0
}

// ============================================
// 复合查询
// ============================================

// 获取任务及其排班信息
export async function getTasksWithSchedule(date?: string): Promise<TaskWithSchedule[]> {
  const tasks = await db.tasks.filter((t) => t.status !== 'abandoned').toArray()
  const schedules = await db.schedules.toArray()

  return tasks.map((task) => {
    const schedule = schedules.find((s) => {
      if (s.task_id !== task.id) return false
      if (date && s.date !== date) return false
      return true
    })

    return {
      ...task,
      schedule,
    }
  })
}

// 获取指定日期的已排班任务
export async function getScheduledTasksForDate(date: string): Promise<TaskWithSchedule[]> {
  const schedules = await getScheduleEventsByDate(date)
  const tasks = await db.tasks.toArray()

  const results: TaskWithSchedule[] = []
  for (const schedule of schedules) {
    const task = tasks.find((t) => t.id === schedule.task_id)
    if (task && task.status !== 'abandoned') {
      results.push({ ...task, schedule })
    }
  }
  return results
}

// 获取待排班任务（今日在"全天"槽中）
export async function getAllDayTasksForDate(date: string): Promise<TaskWithSchedule[]> {
  const schedules = await db.schedules
    .where('date')
    .equals(date)
    .filter((s) => s.is_all_day)
    .toArray()
  const tasks = await db.tasks.toArray()

  const results: TaskWithSchedule[] = []
  for (const schedule of schedules) {
    const task = tasks.find((t) => t.id === schedule.task_id)
    if (task && task.status !== 'abandoned') {
      results.push({ ...task, schedule })
    }
  }
  return results
}

// 获取未排班的任务
export async function getUnscheduledTasks(): Promise<Task[]> {
  const tasks = await db.tasks.filter((t) => t.status !== 'abandoned').toArray()
  const schedules = await db.schedules.toArray()
  const scheduledTaskIds = new Set(schedules.map((s) => s.task_id))

  return tasks.filter((task) => !scheduledTaskIds.has(task.id))
}

// ============================================
// 延期任务
// ============================================

/**
 * 计算延期天数
 * @param scheduleDate 排班日期 (YYYY-MM-DD)
 * @param currentDate 当前日期 (YYYY-MM-DD)
 * @returns 延期天数，如果未延期则返回 0
 */
export function getOverdueDays(scheduleDate: string, currentDate: string): number {
  const schedule = new Date(scheduleDate)
  const current = new Date(currentDate)
  const diffTime = current.getTime() - schedule.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

/**
 * 获取所有延期任务（未完成且排班日期早于指定日期）
 * @param beforeDate 截止日期（不包含），通常是今天的日期
 * @returns 延期任务列表，按延期天数降序排列
 */
export async function getOverdueTasks(beforeDate: string): Promise<TaskWithSchedule[]> {
  const tasks = await db.tasks.toArray()
  const schedules = await db.schedules.toArray()

  const results: TaskWithSchedule[] = []

  for (const schedule of schedules) {
    // 跳过当天及之后的任务
    if (schedule.date >= beforeDate) continue

    const task = tasks.find((t) => t.id === schedule.task_id)
    // 只包含未完成且未放弃的任务
    if (task && task.status === 'todo') {
      results.push({ ...task, schedule })
    }
  }

  // 按延期天数降序排列（延期最久的在前面）
  results.sort((a, b) => {
    const daysA = getOverdueDays(a.schedule!.date, beforeDate)
    const daysB = getOverdueDays(b.schedule!.date, beforeDate)
    return daysB - daysA
  })

  return results
}

// ============================================
// 容量计算
// ============================================

// 计算指定日期的已排班总时长（小时）
export async function getScheduledDurationForDate(date: string): Promise<number> {
  const schedules = await db.schedules
    .where('date')
    .equals(date)
    .filter((s) => !s.is_all_day)
    .toArray()
  return schedules.reduce((sum, s) => sum + s.planned_duration, 0)
}

// 计算容量百分比（默认目标 10 小时）
export async function getCapacityPercentage(date: string, targetHours: number = 10): Promise<number> {
  const scheduled = await getScheduledDurationForDate(date)
  return Math.round((scheduled / targetHours) * 100)
}

// 计算时间槽占用（重叠任务只算一次）
export async function getTimeSlotOccupancy(date: string): Promise<number> {
  const schedules = await db.schedules
    .where('date')
    .equals(date)
    .filter((s) => !s.is_all_day)
    .toArray()

  if (schedules.length === 0) return 0

  // 使用半小时粒度的时间槽（0-47 共 48 个槽位表示 24 小时）
  const occupiedSlots = new Set<number>()

  for (const schedule of schedules) {
    const startSlot = Math.floor(schedule.planned_start * 2)
    const endSlot = Math.ceil((schedule.planned_start + schedule.planned_duration) * 2)

    for (let slot = startSlot; slot < endSlot; slot++) {
      occupiedSlots.add(slot)
    }
  }

  // 转换回小时（每 2 个槽位 = 1 小时）
  return occupiedSlots.size / 2
}

// 获取任务完成进度
export async function getTaskProgress(date: string): Promise<{ completed: number; total: number }> {
  // 获取当天所有已排班任务（包括全天任务）
  const schedules = await db.schedules.where('date').equals(date).toArray()
  const tasks = await db.tasks.toArray()

  let completed = 0
  let total = 0

  for (const schedule of schedules) {
    const task = tasks.find((t) => t.id === schedule.task_id)
    if (task && task.status !== 'abandoned') {
      total++
      if (task.status === 'done') {
        completed++
      }
    }
  }

  return { completed, total }
}

// ============================================
// 数据清理
// ============================================

export async function clearAllData(): Promise<void> {
  await clearDB()
}

// ============================================
// CSV 导出
// ============================================

export async function exportToCsv(startDate: string, endDate: string): Promise<string> {
  const tasks = await db.tasks.toArray()
  const schedules = await db.schedules.toArray()

  const headers = ['task_id', 'title', 'status', 'date', 'planned_start', 'planned_end', 'duration_min', 'notes', 'created_at']
  const rows: string[] = [headers.join(',')]

  // 筛选日期范围内的排班
  const filteredSchedules = schedules.filter((s) => s.date >= startDate && s.date <= endDate)

  for (const schedule of filteredSchedules) {
    const task = tasks.find((t) => t.id === schedule.task_id)
    if (!task) continue

    const plannedEnd = schedule.planned_start + schedule.planned_duration
    const durationMin = Math.round(schedule.planned_duration * 60)

    const row = [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`,
      task.status,
      schedule.date,
      hoursToTime(schedule.planned_start),
      hoursToTime(plannedEnd),
      durationMin.toString(),
      `"${(task.notes || '').replace(/"/g, '""')}"`,
      task.created_at,
    ]
    rows.push(row.join(','))
  }

  return rows.join('\n')
}

function hoursToTime(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}
