import { useRef } from 'react'
import { useTimelineStore } from '../../stores/timelineStore'
import { TimelineSwimlane } from './TimelineSwimlane'
import { ResizableDivider } from './ResizableDivider'
import type { Task, TaskWithSchedule } from '../../types'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

interface SplitPaneContainerProps {
    tasks: TaskWithSchedule[] // All tasks
    selectedDate: string
    onEditTask: (task: Task) => void
    onToggleComplete: (taskId: string) => void
    onScheduleUpdate: (taskId: string, start: number, duration: number) => void
    onCreateAtTime: (hour: number) => void
    onContextMenu: (e: React.MouseEvent, taskId: string) => void
}

export function SplitPaneContainer({
    tasks,
    selectedDate,
    onEditTask,
    onToggleComplete,
    onScheduleUpdate,
    onCreateAtTime,
    onContextMenu,
}: SplitPaneContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { lanes, addLane, removeLane, updateLaneWidth, updateLaneProject, updateLaneTitle } = useTimelineStore()

    // Filter tasks for each lane
    const getLaneTasks = (projectId?: string) => {
        // Main lane (projectId undefined) shows all tasks that do NOT belong to a specific project?
        // OR: Main lane is "Focus Track", so it might show tasks from multiple projects if configured.
        // For MVP:
        // - If lane has projectId, show ONLY tasks with that projectId.
        // - If lane has NO projectId (Main Lane), show tasks with NO projectId (Inbox/Personal) OR explicit "Focus" logic.
        // - Let's assume Main Lane = "No Project" for now to keep it clean, OR "All Tasks" if we prefer.
        // - Per PRD: "Focus Lane" is special. Let's assume standard filtering:

        if (projectId) {
            return tasks.filter(t => t.project_id === projectId)
        } else {
            // Main Lane: Show tasks without project, OR everything?
            // Let's show "Tasks without project" to encourage sorting.
            return tasks.filter(t => !t.project_id)
        }
    }

    const handleResize = (index: number, deltaX: number) => {
        if (!containerRef.current) return
        const containerWidth = containerRef.current.offsetWidth
        const deltaPercent = (deltaX / containerWidth) * 100

        const currentLane = lanes[index]
        const nextLane = lanes[index + 1]

        if (currentLane && nextLane) {
            // Update both lanes to maintain total ~100%
            // Clamping to min width (e.g. 10%)
            const newCurrentWidth = Math.max(10, Math.min(90, currentLane.width + deltaPercent))
            const change = newCurrentWidth - currentLane.width
            const newNextWidth = Math.max(10, Math.min(90, nextLane.width - change))

            // Apply updates
            updateLaneWidth(currentLane.id, newCurrentWidth)
            updateLaneWidth(nextLane.id, newNextWidth)
        }
    }

    return (
        <div
            ref={containerRef}
            className="flex h-full w-full overflow-hidden relative select-none"
            style={{
                backgroundColor: 'var(--color-bg-base)'
            }}
        >
            {lanes.map((lane, index) => {
                const isLast = index === lanes.length - 1
                const isFirst = index === 0
                const laneTasks = getLaneTasks(lane.projectId)

                // Pass lane management actions
                const handleUpdateTitle = (title: string) => updateLaneTitle(lane.id, title)
                const handleUpdateProject = (pid: string | undefined) => updateLaneProject(lane.id, pid)
                const handleClose = isFirst ? undefined : () => removeLane(lane.id)

                return (
                    <div
                        key={lane.id}
                        className="flex flex-col relative border-r border-gray-200 last:border-0 transition-none"
                        style={{
                            width: `${lane.width}%`,
                            minWidth: '200px'
                        }}
                    >
                        {/* Switched to Internal Header in TimelineSwimlane */}
                        {/* Only "Add Lane" button needs a home if we hide header for Main Lane. 
                             Actually, Main Lane header IS hidden by default logic if title empty? 
                             Wait, we want Main Lane header to show "Focus Track". 
                             Let's pass props to Swimlane. */}

                        {/* Overlay "Add Lane" button absolutely if it's the first lane and we want a quick action?
                            Or just rely on the Sidebar or a top toolbar? 
                            The mock showed an "Add" button in the header. 
                            Let's keep the Add Button logic here or pass it down?
                            Passing it down is cleaner. But `TimelineSwimlane` is generic.
                            Let's add a floating "Add Pane" button on the far right of the first pane header if needed.
                            Actually, let's just add a distinct Button outside the lanes or in the first lane's header via a prop?
                            Let's stick to the previous design: Header was part of container. 
                            NOW Header is inside Swimlane.
                            We need to render the "Add Lane" button inside the first lane's header.
                            But `TimelineSwimlane` doesn't know about `addLane`.
                            Let's rely on a global toolbar OR just add a small overlay button in Container for now.
                        */}

                        {isFirst && (
                            <div className="absolute top-2 right-2 z-30">
                                <Button
                                    type="primary"
                                    shape="circle"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => addLane()}
                                    title="Add Project Lane"
                                />
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
                            <TimelineSwimlane
                                tasks={laneTasks}
                                selectedDate={selectedDate}
                                showLabels={index === 0} // Only show time labels on first lane
                                onEditTask={onEditTask}
                                onToggleComplete={onToggleComplete}
                                onScheduleUpdate={onScheduleUpdate}
                                onCreateAtTime={onCreateAtTime}
                                onContextMenu={onContextMenu}

                                // Lane Props
                                laneId={lane.id}
                                laneTitle={lane.title}
                                projectId={lane.projectId}
                                onUpdateLaneTitle={handleUpdateTitle}
                                onUpdateLaneProject={handleUpdateProject}
                                onCloseLane={handleClose}

                                className="flex-1"
                            />
                        </div>

                        {/* Resizer */}
                        {!isLast && (
                            <ResizableDivider
                                onResize={(delta) => handleResize(index, delta)}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
