import { create } from 'zustand'

export interface LaneConfig {
    id: string
    title: string
    projectId?: string // undefined represents "All Projects" or main view
    width: number // percentage, e.g., 50 for 50%
}

interface TimelineState {
    lanes: LaneConfig[]

    // Actions
    addLane: (projectId?: string) => void
    removeLane: (laneId: string) => void
    updateLaneWidth: (laneId: string, width: number) => void
    updateLaneProject: (laneId: string, projectId: string | undefined) => void
    updateLaneTitle: (laneId: string, title: string) => void
    setLanes: (lanes: LaneConfig[]) => void
    resetLanes: () => void
}

const DEFAULT_LANES: LaneConfig[] = [
    {
        id: 'main-lane',
        title: 'Focus Track', // 主视图
        width: 100,
    }
]

export const useTimelineStore = create<TimelineState>((set) => ({
    lanes: DEFAULT_LANES,

    addLane: (projectId?: string) => set((state) => {
        const newId = `lane-${Date.now()}`
        // Simple logic: divide width by existing lanes + 1
        // Ideally this matches the "Split Pane" logic where we split the space
        // For MVP, simply adding it and letting container recalculate logic might be better
        // But store holds the source of truth.

        // Strategy: Add new lane with equal width to others
        const newCount = state.lanes.length + 1
        const newWidth = 100 / newCount

        const updatedLanes = state.lanes.map(l => ({
            ...l,
            width: newWidth
        }))

        return {
            lanes: [
                ...updatedLanes,
                {
                    id: newId,
                    title: projectId ? 'Project Lane' : 'New Lane',
                    projectId,
                    width: newWidth
                }
            ]
        }
    }),

    removeLane: (laneId: string) => set((state) => {
        if (state.lanes.length <= 1) return state // Keep at least one lane

        const remaining = state.lanes.filter(l => l.id !== laneId)
        const newWidth = 100 / remaining.length

        return {
            lanes: remaining.map(l => ({ ...l, width: newWidth }))
        }
    }),

    updateLaneWidth: (laneId: string, width: number) => set((state) => ({
        lanes: state.lanes.map(l =>
            l.id === laneId ? { ...l, width } : l
        )
    })),

    updateLaneProject: (laneId: string, projectId: string | undefined) => set((state) => ({
        lanes: state.lanes.map(l =>
            l.id === laneId ? { ...l, projectId } : l
        )
    })),

    updateLaneTitle: (laneId: string, title: string) => set((state) => ({
        lanes: state.lanes.map(l =>
            l.id === laneId ? { ...l, title } : l
        )
    })),

    setLanes: (lanes) => set({ lanes }),

    resetLanes: () => set({ lanes: DEFAULT_LANES })
}))
