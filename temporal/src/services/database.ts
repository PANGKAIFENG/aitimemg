// ============================================
// Temporal - IndexedDB 数据库层 (使用 Dexie.js)
// ============================================

import Dexie, { type Table } from 'dexie'
import type { Task, ScheduleEvent } from '../types'

// 定义数据库结构
class TemporalDatabase extends Dexie {
    tasks!: Table<Task, string>
    schedules!: Table<ScheduleEvent, string>

    constructor() {
        super('TemporalDB')

        // 定义表结构和索引
        this.version(1).stores({
            tasks: 'id, group, status, created_at',
            schedules: 'id, task_id, date, is_all_day',
        })
    }
}

// 创建数据库实例
export const db = new TemporalDatabase()

// ============================================
// 数据迁移：从 localStorage 迁移到 IndexedDB
// ============================================

const MIGRATION_FLAG = 'temporal_migrated_to_indexeddb'
const OLD_TASKS_KEY = 'temporal_tasks'
const OLD_SCHEDULES_KEY = 'temporal_schedules'

export async function migrateFromLocalStorage(): Promise<boolean> {
    // 检查是否已迁移
    if (localStorage.getItem(MIGRATION_FLAG)) {
        return false
    }

    try {
        // 读取旧数据
        const oldTasksData = localStorage.getItem(OLD_TASKS_KEY)
        const oldSchedulesData = localStorage.getItem(OLD_SCHEDULES_KEY)

        if (oldTasksData) {
            const tasks: Task[] = JSON.parse(oldTasksData)
            if (tasks.length > 0) {
                await db.tasks.bulkPut(tasks)
                console.log(`[Migration] Migrated ${tasks.length} tasks to IndexedDB`)
            }
        }

        if (oldSchedulesData) {
            const schedules: ScheduleEvent[] = JSON.parse(oldSchedulesData)
            if (schedules.length > 0) {
                await db.schedules.bulkPut(schedules)
                console.log(`[Migration] Migrated ${schedules.length} schedules to IndexedDB`)
            }
        }

        // 标记迁移完成（保留旧数据作为备份，不删除）
        localStorage.setItem(MIGRATION_FLAG, new Date().toISOString())
        console.log('[Migration] Migration completed successfully')
        return true
    } catch (error) {
        console.error('[Migration] Failed to migrate:', error)
        return false
    }
}

// ============================================
// 初始化数据库
// ============================================

let initialized = false

export async function initDatabase(): Promise<void> {
    if (initialized) return

    try {
        await db.open()
        await migrateFromLocalStorage()
        initialized = true
        console.log('[DB] Database initialized')
    } catch (error) {
        console.error('[DB] Failed to initialize database:', error)
        throw error
    }
}

// ============================================
// 数据导出/导入
// ============================================

export interface ExportData {
    version: number
    exportedAt: string
    tasks: Task[]
    schedules: ScheduleEvent[]
}

export async function exportAllData(): Promise<ExportData> {
    const tasks = await db.tasks.toArray()
    const schedules = await db.schedules.toArray()

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        tasks,
        schedules,
    }
}

export async function importData(data: ExportData): Promise<{ tasksImported: number; schedulesImported: number }> {
    // 清空现有数据
    await db.tasks.clear()
    await db.schedules.clear()

    // 导入新数据
    if (data.tasks?.length > 0) {
        await db.tasks.bulkPut(data.tasks)
    }
    if (data.schedules?.length > 0) {
        await db.schedules.bulkPut(data.schedules)
    }

    return {
        tasksImported: data.tasks?.length ?? 0,
        schedulesImported: data.schedules?.length ?? 0,
    }
}

// ============================================
// 清空数据
// ============================================

export async function clearAllData(): Promise<void> {
    await db.tasks.clear()
    await db.schedules.clear()
    localStorage.removeItem(MIGRATION_FLAG)
}
