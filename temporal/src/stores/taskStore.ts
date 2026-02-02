import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types'
import { v4 as uuidv4 } from 'uuid'

interface TaskState {
    tasks: Task[]
    addTask: (input: CreateTaskInput) => Task
    updateTask: (id: string, input: UpdateTaskInput) => void
    deleteTask: (id: string) => void
    assignTaskToProject: (taskId: string, projectId: string | undefined) => void
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [],
            addTask: (input) => {
                const newTask: Task = {
                    id: uuidv4(),
                    title: input.title,
                    notes: input.notes || null,
                    status: 'todo',
                    group: input.group || 'neither',
                    executor_type: 'human', // Default to human
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
                set((state) => ({ tasks: [...state.tasks, newTask] }))
                return newTask
            },
            updateTask: (id, input) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, ...input, updated_at: new Date().toISOString() } : t
                    ),
                })),
            deleteTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                })),
            assignTaskToProject: (taskId, projectId) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === taskId
                            ? { ...t, project_id: projectId, updated_at: new Date().toISOString() }
                            : t
                    ),
                })),
        }),
        {
            name: 'temporal_tasks',
        }
    )
)
