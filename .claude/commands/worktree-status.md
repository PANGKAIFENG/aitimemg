---
description: 汇总当前项目所有 worktree、分支、stash 和脏状态，帮助判断是否可以直接开始新需求
---

# /worktree-status

## 目标

- 快速看清当前项目有哪些工位
- 快速看清哪些工位还没收口
- 判断当前是否适合直接开新需求

## 何时使用

- 想知道自己现在有哪些 worktree
- 不确定当前目录还能不能继续开发
- 想先做一次“开工前盘点”

## 必读对象

运行本命令时，优先读取：

1. `.honeycomb/capabilities-local/worktree-playbook.md`
2. `docs/PROJECT/需求开发操作手册.md`

## 执行步骤

直接运行：

```bash
bash scripts/worktree-status.sh
```

## 输出格式

默认输出 4 个部分：

### 1. Worktrees

- 当前有哪些 worktree
- 哪个是主工作区
- 哪个是干净基线

### 2. Branches

- 当前有哪些本地分支
- 各自跟踪哪个远端分支

### 3. Stash

- 是否存在暂存未收口改动

### 4. Recommended Action

按当前状态给出下一步建议，例如：

- 直接开新 feature worktree
- 先收口当前工位
- 先不要在当前目录继续开发

## 成功标准

执行完 `/worktree-status` 后，用户应该清楚：

1. 现在有哪些 worktree
2. 当前主工作区是否脏
3. 是否适合直接开始新需求
