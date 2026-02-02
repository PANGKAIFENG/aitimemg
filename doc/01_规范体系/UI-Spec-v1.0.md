# UI-Spec v1.0

> 目标：任何 AI / 人在不依赖历史页面的情况下，只要遵守这套规范，生成的用户界面就保持一致、克制、专业。

---

## 0. Meta / Design Philosophy

```yaml
philosophy:
  - clarity_over_density
  - consistency_over_creativity
  - explicit_destructive_actions
  - one_primary_action_per_view
  - predictable_interactions
```

---

## 1. Design Tokens

### 1.1 Color

```yaml
color:
  primary: "#3B82F6"
  primaryHover: "#2563EB"
  danger: "#EF4444"
  success: "#10B981"
  warning: "#F59E0B"

  bg: "#FFFFFF"
  bgElevated: "#F9FAFB"
  bgDisabled: "#F3F4F6"

  text: "#111827"
  textSecondary: "#6B7280"
  textDisabled: "#9CA3AF"

  border: "#E5E7EB"
  divider: "#E5E7EB"
```

### 1.2 Typography

```yaml
typography:
  fontFamily: "Inter, system-ui, sans-serif"

  size:
    sm: 12
    base: 14
    lg: 16
    xl: 18
    xxl: 20

  weight:
    regular: 400
    medium: 500
    semibold: 600

  lineHeight:
    tight: 1.3
    normal: 1.5
    loose: 1.7
```

### 1.3 Spacing

```yaml
spacing:
  xs: 4
  sm: 8
  md: 16
  lg: 24
  xl: 32
```

### 1.4 Radius

```yaml
radius:
  sm: 4
  md: 8
  lg: 12
```

### 1.5 Shadow

```yaml
shadow:
  sm: "0 1px 2px rgba(0,0,0,0.05)"
  md: "0 4px 6px rgba(0,0,0,0.08)"
```

### 1.6 Motion

```yaml
motion:
  fast: "120ms ease-out"
  normal: "200ms ease-in-out"
```

---

## 2. Interaction Semantics

### 2.1 Modal

```yaml
modal:
  useWhen:
    - confirmation
    - blocking_decision
  behavior:
    closeOnEsc: true
    closeOnMaskClick: false
  actions:
    primaryOnRight: true
```

### 2.2 Destructive Actions

```yaml
destructive:
  color: danger
  confirmation:
    required: true
    type: modal
    title: "确认删除？"
    description: "此操作不可恢复"
    confirmText: "删除"
    cancelText: "取消"
```

### 2.3 Feedback

```yaml
feedback:
  success:
    pattern: toast
    duration: 2000
  error:
    pattern: toast
    duration: 4000
  blockingError:
    pattern: modal
```

### 2.4 Dropdown & Selection

```yaml
dropdown:
  trigger: click
  closeOnSelect: true
```

---

## 3. Component Contracts

### 3.1 Button

```yaml
button:
  variants: [primary, secondary, danger, ghost]
  sizes: [sm, md, lg]
  states: [default, hover, disabled, loading]
  rules:
    - danger_only_for_destructive
    - max_one_primary_per_view
```

### 3.2 Input

```yaml
input:
  sizes: [sm, md, lg]
  states: [default, focus, error, disabled]
```

### 3.3 Modal Component

```yaml
modalComponent:
  width:
    sm: 360
    md: 480
    lg: 640
  header:
    titleRequired: true
  footer:
    showCancel: true
```

---

## 4. Layout & Page Patterns

### 4.1 List Page

```yaml
listPage:
  sections:
    - filter
    - table
    - actions
  rules:
    - actions_align_right
    - primary_action_max_1
```

### 4.2 Form Page

```yaml
formPage:
  layout: vertical
  submit:
    align: right
    sticky: true
```

### 4.3 Detail Page

```yaml
detailPage:
  layout: sectioned
  actions:
    position: top_right
```

---

## 5. Writing & Feedback Rules

```yaml
copy:
  confirmation:
    delete:
      title: "确认删除？"
      description: "此操作不可恢复"
  success:
    save: "保存成功"
  error:
    default: "操作失败，请重试"
```

---

## 6. Enforcement & Evolution

```yaml
enforcement:
  disallow:
    - custom_color
    - custom_spacing
  validate:
    - token_usage
    - interaction_consistency
  version: "1.0.0"
```

---

说明：
- UI-Spec 是系统能力，不是展示文档
- AI 在生成任何 UI 之前，必须完整加载并遵守该规范
- 所有不一致，视为规范缺失或未被正确执行
