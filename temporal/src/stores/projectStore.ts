import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '../types'
import { v4 as uuidv4 } from 'uuid'

interface ProjectState {
    projects: Project[]
    addProject: (name: string, color: string) => Project
    updateProject: (id: string, updates: Partial<Project>) => void
    archiveProject: (id: string) => void
    restoreProject: (id: string) => void
    deleteProject: (id: string) => void // Only use with caution
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            projects: [],
            addProject: (name, color) => {
                const newProject: Project = {
                    id: uuidv4(),
                    name,
                    color,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
                set((state) => ({ projects: [...state.projects, newProject] }))
                return newProject
            },
            updateProject: (id, updates) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
                    ),
                })),
            archiveProject: (id) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id
                            ? { ...p, status: 'archived', updated_at: new Date().toISOString() }
                            : p
                    ),
                })),
            restoreProject: (id) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id
                            ? { ...p, status: 'active', updated_at: new Date().toISOString() }
                            : p
                    ),
                })),
            deleteProject: (id) =>
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                })),
        }),
        {
            name: 'temporal_projects',
        }
    )
)
