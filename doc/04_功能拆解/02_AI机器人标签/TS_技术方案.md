# TS_技术方案: AI 机器人标签 (Phase 1.6)

## 1. 数据结构变更
在 `Task` 接口中已经新增字段：
```typescript
interface Task {
  // ... 其他字段
  executor_type?: 'human' | 'ai_auto' | 'ai_copilot'; // 默认为 human
}
```

## 2. 前端渲染逻辑
### 2.1 任务卡片样式
在 `ScheduleCard.tsx` 中增加逻辑判断：
- **AI Auto**: 使用金属质感渐变背景 + 🤖 图标 + 扫光动画。
- **AI Co-pilot**: 使用紫色/幻彩微光边框 + ✨ 图标。
- **Human**: 保持现有蓝色边框样式。

### 2.2 动画实现
使用 CSS Keyframes 在 `index.css` 中定义：
- `@keyframes shine`: 金属扫光效果。
- `@keyframes twinkle`: ✨ 图标微动效果。

## 3. 样式变量 (index.css)
定义以下变量：
- `--color-ai-auto-bg`: 金属质感渐变。
- `--color-ai-copilot-glow`: 紫色微光阴影。
- `--color-ai-copilot-border`: #d8b4fe。
