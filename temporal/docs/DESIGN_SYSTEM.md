# Temporal 设计系统 (Design System)

> **设计语言**: 先锋生产力 (Avant-Garde Productivity)
>
> **核心逻辑**: 消灭边界，利用深度

---

## 1. 视觉 DNA

### 1.1 色彩系统 (Colors)

```css
:root {
  /* 底色 - 必须使用骨白，禁止纯白 */
  --color-base: #FDFCFB;           /* 骨白/奶白 - 温暖护眼 */
  --color-surface: #FFFFFF;         /* 容器/卡片背景 */

  /* 灰度级 - 默认使用，保持克制 */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* 强调色 - 仅在必要处使用 */
  --color-primary: #3B82F6;         /* 电光蓝 */
  --color-primary-glow: rgba(59, 130, 246, 0.4);

  /* 语义色 */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-danger-glow: rgba(239, 68, 68, 0.4);

  /* 任务分组色 */
  --color-core: #EF4444;            /* 🔥 核心执行 */
  --color-value: #F59E0B;           /* 💎 价值规划 */
  --color-quick: #3B82F6;           /* ⚡ 快速处理 */
  --color-misc: #10B981;            /* 💬 琐碎闲杂 */
}
```

### 1.2 阴影系统 (Shadows)

```css
:root {
  /* 核心阴影 - 深而不黑，创造悬浮感 */
  --shadow-sm: 0 4px 20px -6px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 10px 40px -12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 35px 60px -15px rgba(0, 0, 0, 0.15);

  /* 霓虹辉光 - 用于关键提醒 */
  --glow-primary: 0 0 15px var(--color-primary-glow);
  --glow-danger: 0 0 15px var(--color-danger-glow);
}
```

**规则**:
- ❌ 禁止使用 1px 灰色边框
- ✅ 统一使用超大模糊阴影
- ✅ 关键提醒使用霓虹辉光效果

### 1.3 圆角系统 (Border Radius)

```css
:root {
  --radius-sm: 8px;                 /* 小元素：按钮、标签 */
  --radius-md: 12px;                /* 卡片、输入框 */
  --radius-lg: 24px;                /* 中型容器 */
  --radius-xl: 32px;                /* 大容器：弹窗、Tray */
  --radius-2xl: 40px;               /* 超大容器：Command Bar */
  --radius-full: 9999px;            /* 胶囊按钮 */
}
```

### 1.4 字体系统 (Typography)

```css
:root {
  /* 字体族 */
  --font-display: 'Playfair Display', Georgia, serif;   /* 日期/大标题 */
  --font-body: 'Inter', -apple-system, sans-serif;      /* 数据/正文 */

  /* 字号 */
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;
}
```

**规则**:
- 日期、大标题 → 衬线体 (Playfair Display)
- 数据、正文 → 无衬线体 (Inter)
- 产生「气质冲突美学」

---

## 2. 组件规范

### 2.1 弹窗 (Modal/Dialog)

**设计理念**: 弹窗像一张「悬浮的白纸」，而非一个「盒子」

```tsx
// ❌ 禁止
- 明确的页眉页脚分隔线
- 死板的带边框输入框
- 右下角的"确定/取消"按钮

// ✅ 必须
- 毛玻璃遮罩: backdrop-blur: 16px
- 进入动效: scale 0.95→1.0 + opacity
- 超大圆角: 32px - 40px
- 无边框输入
```

**弹窗样式模板**:

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  /* 禁止边框 */
  border: none;
}

.modal-title-input {
  font-size: var(--text-2xl);
  font-weight: 600;
  border: none;
  background: transparent;
  outline: none;
  /* 像在写草稿 */
}

.modal-notes-area {
  background: var(--color-gray-50);
  border: none;
  border-radius: var(--radius-md);
  /* 模拟 Notion 块状感 */
}

.modal-action-button {
  /* 悬浮胶囊样式 */
  border-radius: var(--radius-full);
  padding: 12px 24px;
  box-shadow: var(--shadow-md);
}
```

**动效规范 (Framer Motion)**:

```tsx
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
}
```

### 2.2 卡片 (Card)

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  /* 禁止边框 */
  border: none;

  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### 2.3 输入框 (Input)

**语义输入**: 无边框，像在写草稿

```css
/* 标题输入 - 大字号无边框 */
.input-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
}

.input-title::placeholder {
  color: var(--color-gray-300);
}

/* 普通输入 - 仅保留底部焦点线 */
.input-default {
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  padding: 8px 0;
  transition: border-color 0.2s;
}

.input-default:focus {
  border-bottom-color: var(--color-primary);
}

/* 块状输入 - 模拟 Notion */
.input-block {
  background: var(--color-gray-50);
  border: none;
  border-radius: var(--radius-md);
  padding: 12px 16px;
}
```

### 2.4 按钮 (Button)

```css
/* 主要按钮 - 悬浮胶囊 */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  padding: 12px 24px;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.btn-primary:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* 次要按钮 - 幽灵 */
.btn-ghost {
  background: transparent;
  color: var(--color-gray-600);
  border: none;
  padding: 12px 24px;
}

.btn-ghost:hover {
  background: var(--color-gray-100);
}
```

---

## 3. AI 视觉元素

### 3.1 液态感 (Liquid)

进度条、容量感应器带微弱波动动效：

```css
@keyframes wave {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}

.progress-liquid {
  animation: wave 2s ease-in-out infinite;
}
```

### 3.2 发光效果 (Glow)

关键提醒使用霓虹辉光：

```css
/* 超时任务 */
.task-overdue {
  box-shadow: var(--glow-danger);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); }
}

/* 焦点任务 */
.task-focused {
  box-shadow: var(--glow-primary);
}
```

---

## 4. 布局规范

### 4.1 间距系统

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

### 4.2 非对称布局 (Bento Box)

复盘/统计页面使用错落布局：

```tsx
// ❌ 禁止死板的对齐表格
// ✅ 使用 Bento Box 风格
<div className="grid grid-cols-4 gap-4">
  <div className="col-span-2 row-span-2">大卡片</div>
  <div className="col-span-1">小卡片</div>
  <div className="col-span-1">小卡片</div>
  <div className="col-span-1 row-span-2">竖卡片</div>
  <div className="col-span-1">小卡片</div>
</div>
```

---

## 5. 技术栈推荐

### 必须引入

| 库 | 用途 | 原因 |
|----|------|------|
| **Tailwind CSS** | 基础样式 | 原子化 CSS，快速开发 |
| **Framer Motion** | 核心动效 | 「惊艳感」的源泉，物理引擎驱动 |
| **Radix UI** | 逻辑组件 | 无样式，易于套用自定义视觉 |

### 逐步替换

| 当前 | 目标 | 原因 |
|------|------|------|
| Ant Design | Radix UI | AntD 自带厚重样式，难以实现先锋设计 |

---

## 6. 北极星参考产品

开发时请参考以下产品的 UI 细节：

1. **Amie.so** (首选)
   - 任务卡片的折叠优雅
   - 弹窗的纸张轻盈感

2. **Rise.calendar**
   - AI 洞察的数据可视化
   - 深邃渐变和光感

3. **Linear.app**
   - 极致的间距控制
   - 完美的字体对齐

---

## 7. 检查清单

开发任何 UI 组件前，对照此清单：

- [ ] 底色是否使用 `#FDFCFB` 而非纯白？
- [ ] 卡片是否使用阴影而非边框？
- [ ] 阴影是否足够深但不黑？
- [ ] 圆角是否符合规范？
- [ ] 弹窗是否有毛玻璃背景？
- [ ] 弹窗是否有 scale + opacity 进入动效？
- [ ] 输入框是否去除了边框？
- [ ] 按钮是否为胶囊样式？
- [ ] 大标题是否使用衬线体？
- [ ] 正文是否使用无衬线体？
- [ ] 强调色是否克制使用？

---

## 更新日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2025-12-21 | v1.0 | 初始设计系统文档 |
| 2025-12-21 | v1.1 | 补充参考项目样式规范 |

---

## 附录：参考项目样式总结

基于 `/Users/linctex/Downloads/temporal---time-perception` 参考项目：

### 字体风格
```css
/* 小标签/分类标题 - 极小粗体大写 */
.label-tiny {
  font-size: 10px;
  font-weight: 800;           /* font-black */
  text-transform: uppercase;
  letter-spacing: 0.2em;      /* tracking-widest */
  color: var(--color-gray-400);
}

/* 时间显示 - 等宽粗体 */
.time-mono {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.02em;    /* tracking-tighter */
}
```

### 按钮风格
```css
/* 添加按钮 - 白底阴影风格 */
.btn-add {
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid var(--color-gray-100);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.btn-add:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.2);
  transform: scale(0.95);     /* active:scale-90 */
}

/* 切换按钮组 - 灰底激活白 */
.btn-group {
  background: rgba(229, 231, 235, 0.5);  /* bg-gray-200/50 */
  padding: 4px;
  border-radius: 12px;
}

.btn-group-item.active {
  background: white;
  box-shadow: var(--shadow-sm);
  color: var(--color-gray-800);
}
```

### 任务卡片
```css
.task-item {
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid transparent;
}

.task-item:hover {
  border-color: rgba(59, 130, 246, 0.2);  /* hover:border-blue-200 */
}

/* 左侧颜色条 */
.task-color-bar {
  width: 4px;
  height: 16px;
  border-radius: 9999px;
  opacity: 0.4;
}

.task-item:hover .task-color-bar {
  opacity: 1;
}
```

### CommandBar
```css
.command-bar {
  max-width: 640px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(48px);          /* backdrop-blur-3xl */
  border-radius: 40px;
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.2);
  border: 1px solid white;
}

.command-bar input {
  font-size: 30px;                       /* text-3xl */
  font-weight: 500;
}
```

### 时间轴
```css
.timeline-hour {
  height: 96px;               /* h-24 = 6rem = 96px */
  border-top: 1px solid rgba(243, 244, 246, 0.5);
}

.timeline-hour:hover {
  background: rgba(59, 130, 246, 0.03);  /* hover:bg-gray-50/10 */
}

.schedule-card {
  border-radius: 16px;
  border-left: 4px solid var(--color-primary);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.05);
}
```
