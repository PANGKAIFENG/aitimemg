# TS: 项目管理基础 - 技术方案

## 1. 整体设计

### 1.1 新增数据实体

```typescript
// types/project.ts
interface Project {
  id: string;           // UUID
  name: string;
  color: string;        // Hex color, e.g., "#10B981"
  status: 'active' | 'archived';
  created_at: string;   // ISO timestamp
  updated_at: string;
}
```

### 1.2 Task 扩展

```typescript
// 在现有 Task 接口中新增
interface Task {
  // ... 现有字段
  project_id?: string;  // 关联的项目 ID
}
```

---

## 2. 状态管理

### 2.1 新增 projectStore

```typescript
// stores/projectStore.ts
interface ProjectState {
  projects: Project[];
  
  // Actions
  addProject: (name: string, color: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  archiveProject: (id: string) => void;
  restoreProject: (id: string) => void;
}
```

### 2.2 taskStore 扩展

```typescript
// 在 taskStore 中新增
assignTaskToProject: (taskId: string, projectId: string | null) => void;
getTasksByProject: (projectId: string) => Task[];
```

---

## 3. 组件变更

| 组件                     | 变更内容                         |
| :----------------------- | :------------------------------- |
| `ProjectList.tsx`        | 新建，项目列表 CRUD 视图         |
| `ProjectSelector.tsx`    | 新建，项目选择下拉组件           |
| `TaskDetail.tsx`         | 集成 ProjectSelector             |
| `TimelineSwimlane.tsx`   | Header 增加项目选择功能          |
| `SplitPaneContainer.tsx` | Lane 配置增加 projectId 绑定逻辑 |

---

## 4. 数据持久化

本地存储 Key:
- `temporal_projects`: Project[] 

---

## 5. 与分屏时间轴的集成

- `LaneConfig.projectId` 指向 `Project.id`
- 泳道关闭时，仅删除 LaneConfig，不影响 Project 和 Task.project_id
