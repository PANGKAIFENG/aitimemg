# TS: 分屏时间轴技术设计方案

## 1. 总体设计
将原本单列的 `TimelineContainer` 重构为 `SplitPaneContainer`。

## 2. 核心组件拆分
- `TimelineSwimlane`: 独立的列组件，接受 `filter` props。
- `ResizableDivider`: 负责处理 `onMouseDown` 事件并计算百分比宽度。

## 3. 状态管理
在 `useTimelineStore` 中新增 `activeLanes` 数组，存储每列的项目 ID 和宽度比例。
