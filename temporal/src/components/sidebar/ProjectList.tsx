import React, { useState } from 'react'
import { List, Typography, Button, Dropdown, Input, Tag } from 'antd'
import type { MenuProps } from 'antd'
import { PlusOutlined, MoreOutlined, FolderOutlined, DeleteOutlined, EditOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { useProjectStore } from '../../stores/projectStore'
import type { Project } from '../../types'

const { Text } = Typography

const ProjectList: React.FC = () => {
    const { projects, addProject, updateProject, archiveProject, restoreProject } = useProjectStore()
    const [isAdding, setIsAdding] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [showArchived, setShowArchived] = useState(false)

    const activeProjects = projects.filter((p) => p.status === 'active')
    const archivedProjects = projects.filter((p) => p.status === 'archived')

    const handleCreate = () => {
        if (newProjectName.trim()) {
            addProject(newProjectName, '#3B82F6') // Default Blue
            setNewProjectName('')
            setIsAdding(false)
        }
    }

    const handleUpdate = (id: string) => {
        if (editName.trim()) {
            updateProject(id, { name: editName })
            setEditingId(null)
        }
    }

    const getMenuItems = (project: Project): MenuProps['items'] => [
        {
            key: 'edit',
            label: 'Rename',
            icon: <EditOutlined />,
            onClick: () => {
                setEditingId(project.id)
                setEditName(project.name)
            },
        },
        {
            key: 'color',
            label: 'Change Color',
            // Simplified color picker for MVP
            children: [
                { key: '#10B981', label: <Tag color="#10B981">Green</Tag>, onClick: () => updateProject(project.id, { color: '#10B981' }) },
                { key: '#3B82F6', label: <Tag color="#3B82F6">Blue</Tag>, onClick: () => updateProject(project.id, { color: '#3B82F6' }) },
                { key: '#EF4444', label: <Tag color="#EF4444">Red</Tag>, onClick: () => updateProject(project.id, { color: '#EF4444' }) },
                { key: '#F59E0B', label: <Tag color="#F59E0B">Orange</Tag>, onClick: () => updateProject(project.id, { color: '#F59E0B' }) },
                { key: '#8B5CF6', label: <Tag color="#8B5CF6">Purple</Tag>, onClick: () => updateProject(project.id, { color: '#8B5CF6' }) },
            ],
        },
        {
            type: 'divider',
        },
        {
            key: 'archive',
            label: project.status === 'active' ? 'Archive' : 'Restore',
            icon: project.status === 'active' ? <DeleteOutlined /> : <FolderOpenOutlined />,
            onClick: () => {
                if (project.status === 'active') {
                    archiveProject(project.id)
                } else {
                    restoreProject(project.id)
                }
            },
        },
    ]

    const renderItem = (project: Project) => (
        <List.Item
            key={project.id}
            style={{ padding: '8px 12px', border: 'none', cursor: 'pointer' }}
            className="hover:bg-gray-50 rounded-md"
            actions={[
                <Dropdown menu={{ items: getMenuItems(project) }} trigger={['click']}>
                    <Button type="text" size="small" icon={<MoreOutlined />} />
                </Dropdown>,
            ]}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <div
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: project.color,
                        flexShrink: 0,
                    }}
                />
                {editingId === project.id ? (
                    <Input
                        value={editName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                        onBlur={() => handleUpdate(project.id)}
                        onPressEnter={() => handleUpdate(project.id)}
                        autoFocus
                        size="small"
                    />
                ) : (
                    <Text ellipsis style={{ flex: 1, color: project.status === 'archived' ? '#999' : undefined }}>
                        {project.name}
                    </Text>
                )}
            </div>
        </List.Item>
    )

    return (
        <div style={{ padding: '12px 0' }}>
            <div style={{ padding: '0 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" strong style={{ fontSize: 12 }}>
                    PROJECTS
                </Text>
                <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAdding(true)}
                />
            </div>

            <List
                size="small"
                split={false}
                dataSource={activeProjects}
                renderItem={renderItem}
            />

            {isAdding && (
                <div style={{ padding: '0 12px' }}>
                    <Input
                        placeholder="New Project Name"
                        value={newProjectName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectName(e.target.value)}
                        onBlur={handleCreate}
                        onPressEnter={handleCreate}
                        autoFocus
                        size="small"
                    />
                </div>
            )}

            {archivedProjects.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <div
                        style={{
                            padding: '0 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#999',
                        }}
                        onClick={() => setShowArchived(!showArchived)}
                    >
                        <FolderOutlined />
                        <span style={{ fontSize: 12 }}>Archived ({archivedProjects.length})</span>
                    </div>
                    {showArchived && (
                        <List
                            size="small"
                            split={false}
                            dataSource={archivedProjects}
                            renderItem={renderItem}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default ProjectList
