import React, { useState } from 'react'
import { Select, Divider, Input, Space, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useProjectStore } from '../../stores/projectStore'

interface ProjectSelectorProps {
    value?: string
    onChange?: (value: string | undefined) => void
    allowClear?: boolean
    style?: React.CSSProperties
    placeholder?: string
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
    value,
    onChange,
    allowClear = true,
    style,
    placeholder = '选择项目',
}) => {
    const { projects, addProject } = useProjectStore()
    const [newProjectName, setNewProjectName] = useState('')

    const handleAddProject = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault()
        if (!newProjectName.trim()) return
        const newProject = addProject(newProjectName, '#10B981') // Default color green
        setNewProjectName('')
        // Optional: auto-select newly created project
        if (onChange) onChange(newProject.id)
    }

    const dropdownRender = (menu: React.ReactElement) => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
                <Input
                    placeholder="New Project Name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()} // Prevent select interaction
                />
                <Button type="text" icon={<PlusOutlined />} onClick={handleAddProject}>
                    Add
                </Button>
            </Space>
        </>
    )

    return (
        <Select
            style={{ ...style, minWidth: 120 }}
            placeholder={placeholder}
            allowClear={allowClear}
            value={value}
            onChange={onChange}
            dropdownRender={dropdownRender}
            variant="borderless"
            options={projects
                .filter((p) => p.status === 'active')
                .map((p) => ({
                    label: (
                        <Space>
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: p.color,
                                }}
                            />
                            {p.name}
                        </Space>
                    ),
                    value: p.id,
                }))}
        />
    )
}

export default ProjectSelector
