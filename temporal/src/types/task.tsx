// ============================================
// Temporal Phase 1 - 类型定义 (PRD V1.3)
// ============================================

import React from 'react'
import { FireFilled, StarFilled, ThunderboltFilled, CoffeeOutlined } from '@ant-design/icons'

// 任务状态
export type TaskStatus = 'todo' | 'done' | 'abandoned'

// 任务分组类型（艾森豪威尔矩阵四象限）
export type TaskGroup = 'urgent_important' | 'important' | 'urgent' | 'neither'

// 任务分组配置
export const TASK_GROUP_CONFIG: Record<TaskGroup, { label: string; icon: React.ReactNode; color: string }> = {
  urgent_important: { label: '重要且紧急', icon: <FireFilled />, color: '#EF4444' },   // 红色 - 立即执行
  important: { label: '重要不紧急', icon: <StarFilled />, color: '#F59E0B' },          // 橙色 - 计划执行
  urgent: { label: '紧急不重要', icon: <ThunderboltFilled />, color: '#3B82F6' },             // 蓝色 - 委派或快速处理
  neither: { label: '不重要不紧急', icon: <CoffeeOutlined />, color: '#10B981' },          // 绿色 - 考虑删除
}

// 任务类型（tasks 表）
export interface Task {
  id: string
  title: string                    // 任务标题（含【】标签）
  notes: string | null             // Markdown 格式备注
  status: TaskStatus
  group: TaskGroup                 // 任务分组
  project_id?: string             // 关联的项目 ID (Phase 1.5.1)
  executor_type?: 'human' | 'ai_auto' | 'ai_copilot' // 执行者类型 (Phase 1.6)
  created_at: string
  updated_at: string
}

// 排班事件类型（schedule_events 表）
export interface ScheduleEvent {
  id: string
  task_id: string
  date: string                     // 排班日期 YYYY-MM-DD
  planned_start: number            // 计划开始（0-24，如 14.5 = 14:30）
  planned_duration: number         // 计划时长（小时，最小 0.5）
  is_all_day: boolean             // 是否在"今日待排班"槽
  actual_done_at: string | null   // 实际完成时间（预留）
  offset_min: number | null       // 偏差分钟数（预留）
}

// 创建任务的输入
export interface CreateTaskInput {
  title: string
  notes?: string
  group?: TaskGroup
}

// 更新任务的输入
export interface UpdateTaskInput {
  title?: string
  notes?: string | null
  status?: TaskStatus
  group?: TaskGroup
  executor_type?: 'human' | 'ai_auto' | 'ai_copilot'
}

// 创建排班事件的输入
export interface CreateScheduleEventInput {
  task_id: string
  date: string
  planned_start: number
  planned_duration: number
  is_all_day?: boolean
}

// 更新排班事件的输入
export interface UpdateScheduleEventInput {
  planned_start?: number
  planned_duration?: number
  is_all_day?: boolean
  actual_done_at?: string | null
}

// 任务 + 排班事件的联合类型（用于显示）
export interface TaskWithSchedule extends Task {
  schedule?: ScheduleEvent
}

// CSV 导出数据行（PRD V1.3）
export interface CsvExportRow {
  task_id: string
  title: string
  status: TaskStatus
  date: string
  planned_start: string           // HH:MM 格式
  planned_end: string             // HH:MM 格式
  duration_min: number
  notes: string
  created_at: string
}

// ============================================
// 工具函数
// ============================================

// 从标题中提取【】标签
export function extractTags(title: string): string[] {
  const regex = /【([^】]+)】/g
  const tags: string[] = []
  let match
  while ((match = regex.exec(title)) !== null) {
    tags.push(match[1])
  }
  return tags
}

// 将小时数转换为 HH:MM 格式
export function hoursToTimeString(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

// 将 HH:MM 转换为小时数
export function timeStringToHours(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h + m / 60
}

// 计算计划结束时间
export function getPlannedEnd(start: number, duration: number): number {
  return Math.min(start + duration, 24)
}
